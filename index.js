import dotenv from "dotenv";
import Shopify from "shopify-api-node";

dotenv.config();

const shopify = new Shopify({
  shopName: process.env.SHOPIFY_SHOP_NAME,
  apiKey: process.env.SHOPIFY_API_KEY,
  password: process.env.SHOPIFY_API_PASSWORD,
  apiVersion: "2023-04",
});

async function updateProductTags() {
  let params = { limit: 250 };
  let products = [];

  do {
    const batch = await shopify.product.list(params);
    products = products.concat(batch);
    params = batch.nextPageParameters;
  } while (params !== undefined);

  const now = new Date();

  for (const product of products) {
    const createdAt = new Date(product.created_at);
    const daysOld = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));

    let newTag = "";
    if (daysOld <= 13) newTag = "0-13-dagar";
    else if (daysOld <= 29) newTag = "14+dagar";
    else if (daysOld <= 89) newTag = "30+dagar";
    else newTag = "90+dagar";

    const tags = product.tags
      .split(",")
      .map((t) => t.trim())
      .filter(
        (t) =>
          t !== "0-13-dagar" &&
          t !== "14+dagar" &&
          t !== "30+dagar" &&
          t !== "90+dagar"
      );

    tags.push(newTag);

    await shopify.product.update(product.id, {
      tags: tags.join(", "),
    });

    console.log(`✅ ${product.title} => ${newTag}`);
  }
}

updateProductTags().catch(console.error);