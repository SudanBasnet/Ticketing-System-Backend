export const validate = (schemas) => (req, _res, next) => {
    if (schemas.body)
        req.body = schemas.body.parse(req.body);
    if (schemas.params)
        req.params = schemas.params.parse(req.params);
    if (schemas.query) {
        const parsedQuery = schemas.query.parse(req.query);
        // Express 5 exposes req.query as a getter, so direct assignment throws.
        // Shadow the getter for the remainder of this request with validated data.
        Object.defineProperty(req, "query", {
            value: parsedQuery,
            writable: true,
            configurable: true
        });
    }
    next();
};
