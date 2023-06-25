const express = require("express");
const cors = require("cors");
const fetch = require('node-fetch');
const axios = require("axios")
const Redis = require("redis")


const client = Redis.createClient()
const app = express()
app.use(cors())
app.use(express.json())


app.get("/api", async (req, res) => {
  products = await getOrSetCache("products", async () => {
    const { data } = await axios.get("https://dummyjson.com/products")
    return data
  }
  )
  return res.json(products)
})



const getOrSetCache = async (key, cb) => {
  return new Promise((resolve, reject) => {
    client.get(key, async (err, data) => {
      if (err) return reject(err)
      if (data !== null) {
        console.log("from cache")
        return resolve(JSON.parse(data))
      }
      const freshData = await cb()
      client.setex(key, 3600, JSON.stringify(freshData))
      resolve(freshData)
    })
  })
}

app.listen(5000, () => console.log("server is running on port 5000"))