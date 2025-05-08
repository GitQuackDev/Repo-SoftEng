// Script to clean up malformed lesson progress entries (removes any without a student field)
const mongoose = require('mongoose');
const Course = require('../models/Course');
const db = require('../config/db');

(async () => {
  await db();
  const courses = await Course.find({});
  let fixed = 0;
  for (const course of courses) {
    let changed = false;
    for (const lesson of course.lessons) {
      if (Array.isArray(lesson.progress)) {
        const before = lesson.progress.length;
        lesson.progress = lesson.progress.filter(p => p.student);
        if (lesson.progress.length !== before) changed = true;
      }
    }
    if (changed) {
      await course.save();
      fixed++;
    }
  }
  console.log(`Fixed progress in ${fixed} courses.`);
  process.exit(0);
})();
