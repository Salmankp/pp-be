
const Category = require('../models/category')
const { slugify } = require('../helpers/helper');

exports.createOne = async (req, res, next) => {
    try {
        const slug = slugify(req.body.name);
        const doc = await Category.create({ categoryName: req.body?.categoryName, slug });
        res.status(201).json({
            status: 'success',
            data: {
                doc
            }
        });

    } catch (error) {
        next(error);
    }
};

exports.getOne = async (req, res, next) => {
    try {
        const doc = await Category.findById(req.params.id);

        if (!doc) {
            return next(new AppError(404, 'fail', 'No document found with that id'), req, res, next);
        }

        res.status(200).json({
            status: 'success',
            data: {
                doc
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.getAll = async (req, res, next) => {
    try {
        const categories = await Category.find();


        res.status(200).json({
            status: 'success',

            data: {
                data: categories
            }
        });

    } catch (error) {
        next(error);
    }

};

exports.getAllCategoriesWithChildren = async (req, res, next) => {
    try {
        const categories = await Category.aggregate([
            {
                $lookup: {
                    'from': 'subpaymentmethods',
                    'localField': '_id',
                    'foreignField': 'giftCardCategoryId',
                    'as': 'subPayment'
                }
            },
            {
                $unwind: {
                    path: "$subPayment",
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $lookup: {
                    'from': 'offers',
                    'localField': 'subPayment._id',
                    'foreignField': 'subPaymentMethodId',
                    'as': 'offer'
                }
            },
            { "$match": { "offer.cryptoCurrencyType": req?.query?.currencyType } },
            {
                $group: {
                    _id: "$_id",
                    name: { $first: "$categoryName" },
                    subPayments: {
                        $push: {
                            name: "$subPayment.name",
                            id: "$subPayment._id",
                            total: { $sum: 1 },
                            offers: "$offer",
                        }
                    },

                }
            },
            {
                $addFields: {
                    total: { $sum: '$subPayments.total' },
                }
            }
        ]);


        res.status(200).json({
            status: 'success',
            data: categories

        });

    } catch (error) {
        next(error);
    }

};