import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import ResNet50
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D
from tensorflow.keras.models import Model
import json
import os

# Paths
data_dir = 'dataset'
model_path = 'finetuned_cnn.h5'
labels_path = 'class_labels.json'

# Data generator
datagen = ImageDataGenerator(validation_split=0.2, rescale=1./255, horizontal_flip=True, rotation_range=20)
train_gen = datagen.flow_from_directory(
    data_dir, target_size=(224, 224), batch_size=16, class_mode='categorical', subset='training'
)
val_gen = datagen.flow_from_directory(
    data_dir, target_size=(224, 224), batch_size=16, class_mode='categorical', subset='validation'
)

# Save class labels
class_labels = {v: k for k, v in train_gen.class_indices.items()}
with open(labels_path, 'w') as f:
    json.dump(class_labels, f)

# Model
base_model = ResNet50(weights='imagenet', include_top=False)
x = base_model.output
x = GlobalAveragePooling2D()(x)
x = Dense(128, activation='relu')(x)
predictions = Dense(train_gen.num_classes, activation='softmax')(x)
model = Model(inputs=base_model.input, outputs=predictions)

# Freeze base model
for layer in base_model.layers:
    layer.trainable = False

model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
model.fit(train_gen, epochs=5, validation_data=val_gen)

# Unfreeze and fine-tune
for layer in base_model.layers:
    layer.trainable = True

model.compile(optimizer=tf.keras.optimizers.Adam(1e-5), loss='categorical_crossentropy', metrics=['accuracy'])
model.fit(train_gen, epochs=5, validation_data=val_gen)

# Save model
model.save(model_path)
print(f"Model saved to {model_path}")
print(f"Class labels saved to {labels_path}")
