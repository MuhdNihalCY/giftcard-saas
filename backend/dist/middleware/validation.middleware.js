"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const errors_1 = require("../utils/errors");
const validate = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errors = error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));
                next(new errors_1.ValidationError(JSON.stringify(errors)));
            }
            else {
                next(error);
            }
        }
    };
};
exports.validate = validate;
//# sourceMappingURL=validation.middleware.js.map