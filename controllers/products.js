const Product = require("../models/product");
const redisClient = require("../redis");

const getAllProductsStatic = async (req, res) => {
  const search = "a";
  const products = await Product.find({}).sort("-name price");
  res.status(200).json({ products, nbHits: products.length });
};

const getAllProducts = async (req, res) => {
  const { featured, company, name, sort, fields, numericFilters } = req.query;
  const queryObject = {};

  if (featured) {
    queryObject.featured = featured === "true" ? true : false;
  }
  if (company) {
    queryObject.company = company;
  }
  if (name) {
    queryObject.name = { $regex: name, $options: "i" };
  }
  if (numericFilters) {
    const operatorMap = {
      ">": "$gt",
      ">=": "$gte",
      "=": "$eq",
      "<": "$lt",
      "<=": "$lte",
    };
    const regEx = /\b(<|>|>=|<=|=)\b/g;
    let filters = numericFilters.replace(regEx, (match) => {
      `-${operatorMap[match]}-`;
    });
    const options = ["price", "rating"];
    filters = filters.split(",").forEach((element) => {
      const [field, operator, value] = element.split("-");
      if (options.includes(field)) {
        queryObject[field] = { [operator]: Number(value) };
      }
    });
  }

  let result = Product.find(queryObject);
  if (sort) {
    const sortedList = sort.split(",").join(" ");
    result = result.sort(sortedList);
  } else {
    result.sort("createdAt");
  }

  if (fields) {
    const fieldList = fields.split(",").join(" ");
    result = result.select(fieldList);
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);
  const products = await result;
  // console.log(queryObject);

  res.status(200).json({ products, nbHits: products.length });
};

const getProductByID = async (req, res) => {
  console.log("in controller");
  const { id: productID } = req.params;
  const product = await Product.findOne({ _id: productID });

  if (!product) {
    throw new Error(`No product with id : ${productID}`);
  }
  const { _id, featured, rating, createdAt, name, price, company } = product;
  await redisClient.connect();
  await redisClient.hSet(_id, "featured", featured);
  await redisClient.hSet(_id, "rating", rating);
  await redisClient.hSet(_id, "createdAt", createdAt);
  await redisClient.hSet(_id, "name", name);
  await redisClient.hSet(_id, "price", price);
  await redisClient.hSet(_id, "company", company);
  await redisClient.disconnect();
  res.status(200).json({ product });
};

module.exports = {
  getAllProducts,
  getAllProductsStatic,
  getProductByID,
};
