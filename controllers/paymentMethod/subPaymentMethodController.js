const subPaymentMethodModel = require('../../models/subPaymentMethodModel');
const paymentMethodModel = require('../../models/paymentMethodModel');

const offer = require('../../models/offerModel');

const {slugify} = require('../../helpers/helper');
const Model = subPaymentMethodModel;
exports.deleteOne = async ( req, res, next ) => {
	try {
		const doc = await Model.findByIdAndDelete(req.params.id);
		
		if ( !doc ) {
			return next(new AppError(404, 'fail', 'No document found with that id'), req, res, next);
		}
		
		res.status(204).json({
			status: 'success',
			data: null
		});
	} catch ( error ) {
		next(error);
	}
};

exports.updateOne = async ( req, res, next ) => {
	try {
		const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true
		});
		
		if ( !doc ) {
			return next(new AppError(404, 'fail', 'No document found with that id'), req, res, next);
		}
		
		res.status(200).json({
			status: 'success',
			data: {
				doc
			}
		});
		
	} catch ( error ) {
		next(error);
	}
};

exports.createOne = async ( req, res, next ) => {
	try {
		const slug = slugify(req.body.name)
		const doc = await Model.create({...req.body,slug});
		await paymentMethodModel.findByIdAndUpdate({_id: req.body.paymentMethodId},{
		$addToSet:{subPayment:doc._id}
		})
		res.status(201).json({
			status: 'success',
			data: {
				doc
			}
		});
		
	} catch ( error ) {
		next(error);
	}
};

exports.getOne = async ( req, res, next ) => {
	try {
		const doc = await Model.findById(req.params.id);
		
		if ( !doc ) {
			return next(new AppError(404, 'fail', 'No document found with that id'), req, res, next);
		}
		
		res.status(200).json({
			status: 'success',
			data: {
				doc
			}
		});
	} catch ( error ) {
		next(error);
	}
};

exports.getAll = async ( req, res, next ) => {
	try {
		const features = await Model.find().populate('paymentMethodId')
		res.status(200).json({
			status: 'success',
			data: {
				data: features
			}
		});
		
	} catch ( error ) {
		next(error);
	}
	
};
exports.list = async ( req, res, next ) => {
	try {
		const features = await Model.find({paymentMethodId:req.params.id}).lean();
	console.log(await countOffers(features));
		res.status(200).json({
			status: 'success',
			data: {
				data: await countOffers(features)
			}
		});
		
	} catch ( error ) {
		next(error);
	}
	
};
async function countOffers( methods){
	for ( const method of methods ) {
		method.total = await offer.count({subPaymentMethodId: method._id})}
	return methods
}
