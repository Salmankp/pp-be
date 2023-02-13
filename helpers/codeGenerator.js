const generator = require("generate-password");

exports.emailCodeGenerator = () => {
  return generator.generate({
    length: 6,
    numbers: true,
    symbols: false,
    lowercase: false,
    uppercase: false,
  });
}
