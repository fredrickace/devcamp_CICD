const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const Bootcamp = require('../models/Bootcamp');


// @desc Get all bootcamps
// @route GET /api/v1/bootcamps
// @access Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    let query;

    //Copy req.query
    const reqQuery = {...req.query};

    //Fields to execute
    const removeFields = ['select', 'sort', 'page', 'limit'];

    //Loop over removeFields and delete them from reqQuery

    removeFields.forEach(param => delete reqQuery[param]);

    //Create query String
    let queryString = JSON.stringify(reqQuery);

    //Create operators ($gt, $gte etc)
    queryString = queryString.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    //Finding resource
    query = Bootcamp.find(JSON.parse(queryString)).populate('courses');
    // query = Bootcamp.find(JSON.parse(queryString)).populate({
    //     path: 'courses',
    //     select: 'title description'
    // });

    //Select Fields
    if (req.query.select) {
        //The mongoose selector needs the space between fields not the comma's. The string from select in the query
        // are separated by comma's. The below code splits the string into an array using comma and join them as a
        // string again using the space.
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);

    }

    //Sort
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    //Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 100;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Bootcamp.countDocuments();
    console.log(`Total:${total}`);
    query = query.skip(startIndex).limit(limit);

    //Executing Query
    const bootcamps = await query;
    const pagination = {};
    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        }
    }

    if (startIndex > 0) {
        pagination.previous = {
            page: endIndex > total ? total : page - 1,
            limit
        }
    }

    res.status(200)
        .json({success: true, count: bootcamps.length, pagination, data: bootcamps});
});


// @desc Get single bootcamp
// @route GET /api/v1/bootcamps/:id
// @access Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {

    const bootcamp = await Bootcamp.findById(req.params.id).populate('courses');
    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    }
    res.status(200).json({success: true, data: bootcamp});


})
;

// @desc Create new bootcamp
// @route POST /api/v1/bootcamps/:id
// @access Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {

    const bootcamp = await Bootcamp.create(req.body);
    res.status(201).json({
        success: true,
        data: bootcamp
    });
    // console.log(req.body);
    // res.status(200).json({success:true, msg:'Create new bootcamp'});
});

// @desc Update  bootcamp
// @route PUT /api/v1/bootcamps/:id
// @access Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    }
    res.status(200).json({success: true, data: bootcamp});

});

// @desc Delete bootcamp
// @route DELETE/api/v1/bootcamps/:id
// @access Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    // const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id); // This Method will not trigger the delete
    // courses.
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    }
    bootcamp.remove();
    res.status(200).json({success: true, data: {}});

});


// @desc Get bootcamps within the radius
// @route GET/api/v1/bootcamps/radius/:zipcode/:distance
// @access Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
    const {zipcode, distance} = req.params;

//    Get lat/lng from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

//    Calc radius using radians
//    Divide dist by radius of Earth
//    Earth Radius = 3693 miles/6378 Kms
    const radius = distance / 6378.1;
    const bootcamp = await Bootcamp.find({
        location: {$geoWithin: {$centerSphere: [[lng, lat], radius]}}
    });

    res.status(200).json({
        success: true,
        count: bootcamp.length,
        data: bootcamp
    })
});

// @desc Upload bootcamp
// @route PUT /api/v1/bootcamps/:id/photo
// @access Private
exports.uploadBootcampPhoto = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    }

    if (!req.files) {
        return next(new ErrorResponse(`Please upload a file`, 400));
    }

    const file = req.files.image;


//    Make sure the image is a photo

    if (!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse(`Please upload an image file`, 400));
    }

//    Check file size
    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400));
    }

//    Create custom file name
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if (err) {
            console.error(err);
            return next(new ErrorResponse(`Problem with file upload`, 500));
        }

        await Bootcamp.findByIdAndUpdate(req.params.id, {photo: file.name});

        res.status(200).json({
            success:true,
            data:file.name
        });

    });

    console.log(file.name);

});