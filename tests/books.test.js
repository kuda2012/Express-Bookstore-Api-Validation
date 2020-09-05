process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testBookData;
beforeEach(async () => {
  testBookData = {
    isbn: "0691161518",
    amazon_url: "http://a.co/eobPtX2",
    author: "Matthew Lane",
    language: "english",
    pages: 264,
    publisher: "Princeton University Press",
    title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
    year: 2017,
  };
});

describe("POST /books", () => {
  it("Should create a book", async () => {
    let response = await request(app).post("/books").send(testBookData);
    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({ book: testBookData });
  });
  it("Should fail to create a book due to lack of info", async () => {
    testBookData = {
      amazon_url: "http://a.co/eobPtX2",
      author: "Matthew Lane",
      language: "english",
      pages: 264,
      publisher: "Princeton University Press",
      title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
      year: 2017,
    };
    let response = await request(app).post("/books").send(testBookData);
    expect(response.statusCode).toBe(400);
  });
  it("Should not create a duplicate book", async () => {
    let response = await request(app).post("/books").send(testBookData);
    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({ book: testBookData });
    let response2 = await request(app).post("/books").send(testBookData);
    expect(response2.statusCode).toBe(409);
  });
});

describe("Put /books/:isbn", () => {
  it("Should update a book", async () => {
    const postResponse = await request(app).post("/books").send(testBookData);
    expect(postResponse.body.book.language).toBe("english");
    let partialUpdateOfBook = { language: "spanish" };
    let putResponse = await request(app)
      .put(`/books/${testBookData.isbn}`)
      .send(partialUpdateOfBook);
    expect(putResponse.statusCode).toBe(200);
    expect(putResponse.body.book.language).toEqual("spanish");
  });
  it("Should only make updates if entered keys are applicable to schema", async () => {
    await request(app).post("/books").send(testBookData);
    let partialUpdateOfBook = {
      moneyTeam: "FloydMaywhether",
      favShow: "IDK, hard to pick",
    };
    let response = await request(app)
      .put(`/books/${testBookData.isbn}`)
      .send(partialUpdateOfBook);
    expect(response.statusCode).toBe(200);
    expect(response.body.book.moneyTeam).toEqual(undefined);
    expect(response.body.book.favShow).toEqual(undefined);
  });
  it("Should remain unchanged if there are no entries in request body", async () => {
    await request(app).post("/books").send(testBookData);
    let blankJSONBody = {};
    let response = await request(app)
      .put(`/books/${testBookData.isbn}`)
      .send(blankJSONBody);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ book: testBookData });
  });
});

afterEach(async function () {
  // delete any data created by test
  await db.query("DELETE FROM books");
});

afterAll(async function () {
  // close db connection
  await db.end();
});
