const Wallet = require('../../models/walletModel');
const Model = Wallet
const AppError = require('../../utils/appError');
exports.deleteOne =  async (req, res, next) => {
	try {
		const doc = await Model.findByIdAndDelete(req.params.id);
		
		if (!doc) {
			return next(new AppError(404, 'fail', 'No document found with that id'), req, res, next);
		}
		
		res.status(204).json({
			status: 'success',
			data: null
		});
	} catch (error) {
		next(error);
	}
};

exports.updateOne =  async (req, res, next) => {
	try {
		const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true
		});
		
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

exports.createOne =  async (req, res, next) => {
	try {
		const doc = await Model.create(req.body);
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

exports.getOne =  async (req, res, next) => {
	try {
		let doc = await Model.findOne({user: req.params.id});
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

exports.getAll =  async (req, res, next) => {
	try {
		res.status(200).json({
			status: 'success',
			data: {
				data: await Model.find().populate('user')
			}
		});
		
	} catch (error) {
		next(error);
	}
	
};
