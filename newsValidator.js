import * as Yup from "yup";

const createNewsSchema = Yup.object().shape({
    title: Yup.string().required(),
    body: Yup.string().required(),
});

async function validateCreateNews(data) {
    try {
        // Validate the data against the schema
        const validatedData = await createNewsSchema.validate(data, { abortEarly: false });
        return validatedData;
    } catch (error) {
        throw new Error(error.errors);
    }
}

export { createNewsSchema, validateCreateNews }