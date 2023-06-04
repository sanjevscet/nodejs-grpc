import * as Yup from "yup";
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import { validateCreateNews } from "./newsValidator.js";
const PROTO_PATH = "./news.proto";
const options = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
}
const packageDefinition = protoLoader.loadSync(PROTO_PATH, options);
const newsProto = grpc.loadPackageDefinition(packageDefinition)
const server = new grpc.Server();

const news = [
    { id: "1", title: "Note 12", body: "Content 1", postImage: "Post Image 1" },
    { id: "2", title: "Note 22", body: "Content 2", postImage: "Post Image 2" }
];


server.addService(newsProto.NewsService.service, {
    // get All News
    getAllNews: (_, callback) => {
        callback(null, { news });
    },

    // get News By Id
    getNews: (data, callback) => {
        const newsId = data.request.id;
        const newsItem = news.find(({ id }) => id === newsId);
        // if data not found, change status code & add error msg
        if (!newsItem) {
            const error = {
                code: grpc.status.NOT_FOUND,
                message: 'Sanjeev, Data not found!',
            };
            callback(error)

        }
        callback(null, newsItem)
    },

    // delete News By Id
    deleteNews: (data, callback) => {
        const newsId = data.request.id;
        const index = news.findIndex(({ id }) => id === newsId);
        console.log({ index })
        if (index !== -1) {
            news.splice(index, 0)
            callback(null, {})

        }
        const error = {
            code: grpc.status.INVALID_ARGUMENT,
            message: 'Sanjeev, Data not found for given Id!',
        };
        callback(error)
        // news = news.filter(({ id }) => id !== newsId)

    },

    // Update Passed Id's News
    editNews: (data, callback) => {
        const { id: newsId, body, title, postImage } = data.request;
        const newsItem = news.find(({ id }) => id === newsId);
        Object.assign(newsItem, { body, title, postImage });

        callback(null, newsItem)
    },

    // Add a new News
    addNews: (data, callback) => {
        const payload = { ...data.request };
        console.log({ payload })
        let _news = { id: Date.now(), ...payload };
        news.push(_news);
        console.log({ news })

        callback(null, _news)
    },
    createNews: async (call, callback) => {
        const { request: data } = call;
        try {
            await validateCreateNews(data);
            const { id, title, body, postImage } = data;
            news.push({ id, title, body, postImage })
            // console.log({ data });
            callback(null, data)

        } catch (error) {
            console.log({ error, m: error.message })
            callback({ message: error.message, code: grpc.status.INVALID_ARGUMENT })
        }
        // console.log({ data })
    },
});


server.bindAsync("127.0.0.1:50051", grpc.ServerCredentials.createInsecure(), (_, port) => {
    console.log("Server at port:", port)
    console.log("Server running at http://127.0.0.1:50051");
    server.start();
})
