const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');


// @desc Get Courses
// @route GET /api/v1/courses
// @route GET /api/v1/bootcamps/:bootcampId/courses
// @access Public
exports.getCourses = asyncHandler(async (req, res, next) => {
    let query;

    if (req.params.bootcampId) {
        query = Course.find({ bootcamp: req.params.bootcampId});
    } else {
        // query = Course.find().populate('bootcamp'); This will get all fields of bootcamp
        query = Course.find().populate({
            path:'bootcamp',
            select:'name description'
        });
    }

    const courses = await query;

    res
        .status(200)
        .json({
            success: true,
            count: courses.length,
            data: courses
        });
});


// @desc Get single Courses
// @route GET /api/v1/courses/:id
// @access Public
exports.getCourse = asyncHandler(async (req, res, next) => {

    const course = await Course.findById(req.params.id).populate({
        path:'bootcamp',
        select: 'name description'
    });

    if(!course) {
        return next(
            new ErrorResponse(`No Course with the id: ${req.params.id}`, 404)
        );
    }

    res
        .status(200)
        .json({
            success: true,
            data: course
        });
});

// @desc Add Courses
// @route GET /api/v1/bootcamps/:bootcampId/courses
// @access Private
exports.addCourse = asyncHandler(async (req, res, next) => {

   req.body.bootcamp = req.params.bootcampId;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if(!bootcamp) {
        return next(
            new ErrorResponse(`No Bootcamp with the id: ${req.params.bootcampId}`, 404)
        );
    }

    const course = await Course.create(req.body);

    res
        .status(200)
        .json({
            success: true,
            data: course
        });
});