import { object as YupObject, string as YupString } from "yup";

export const createNewsSchema = YupObject({
    title: YupString().required(),
    body: YupString().required(),
});