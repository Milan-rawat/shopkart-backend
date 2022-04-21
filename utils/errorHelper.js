const { validationResult, body } = require('express-validator')

module.exports.errorValidation = (req, res) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() })
	}
}

module.exports.validateBody = (field = []) => {
	return field.map((item) =>
		body(item).not().isEmpty().withMessage(`${item} field is required`)
	)
}

module.exports.throwErrorMessage = (err, res) => {
	let error = err
	console.log('NEW error : ', error)
	return res.status(400).json({ error: error })
}
