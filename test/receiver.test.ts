import supertest from "supertest";
import { web } from "../src/application/web";
import { logger } from "../src/application/logging";
import { LetterTest, ReceiverTest } from "./test-util";
import { UserTest } from "./test-util";
import { prismaClient } from "../src/application/database";

describe("POST /api/penerima", () => {
  beforeEach(async () => {
    await UserTest.create();
  });

  afterEach(async () => {
    await ReceiverTest.deleteAll();
    await UserTest.delete();
  });

  it("should reject create receiver if request is invalid", async () => {
    const response = await supertest(web)
      .post("/api/penerima")
      .set("X-API-TOKEN", "test")
      .send({
        nama: "",
        email: "",
      });

    logger.debug(response.body);
    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });

  it("should reject create receiver if email is invalid", async () => {
    const response = await supertest(web)
      .post("/api/penerima")
      .set("X-API-TOKEN", "test")
      .send({
        nama: "Test",
        email: "invalid-email",
      });

    logger.debug(response.body);
    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });

  it("should create receiver", async () => {
    const response = await supertest(web)
      .post("/api/penerima")
      .set("X-API-TOKEN", "test")
      .send({
        nama: "Test Receiver",
        email: "test@example.com",
      });

    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(response.body.data.id).toBeDefined();
    expect(response.body.data.nama).toBe("Test Receiver");
    expect(response.body.data.email).toBe("test@example.com");
  });

  it("should reject create receiver if email already exists", async () => {
    await ReceiverTest.create({
      email: "test@example.com",
    });

    const response = await supertest(web)
      .post("/api/penerima")
      .set("X-API-TOKEN", "test")
      .send({
        nama: "Test Receiver",
        email: "test@example.com", // Same email as created above
      });

    logger.debug(response.body);
    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });
});

describe("GET /api/penerima/:id", () => {
  beforeEach(async () => {
    await UserTest.create();
    await ReceiverTest.create();
  });

  afterEach(async () => {
    await ReceiverTest.deleteAll();
    await UserTest.delete();
  });

  it("should be able to get receiver", async () => {
    const receiver = await ReceiverTest.create({
      email: `get-test-${Date.now()}@example.com`,
    });

    const response = await supertest(web)
      .get(`/api/penerima/${receiver.id}`)
      .set("X-API-TOKEN", "test");

    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(receiver.id);
    expect(response.body.data.nama).toBe(receiver.nama);
    expect(response.body.data.email).toBe(receiver.email);
    expect(response.body.data.total_surat).toBeDefined();
  });

  it("should reject get receiver if receiver not found", async () => {
    const response = await supertest(web)
      .get("/api/penerima/9999") // Non-existent ID
      .set("X-API-TOKEN", "test");

    logger.debug(response.body);
    expect(response.status).toBe(404);
    expect(response.body.errors).toBeDefined();
  });

  it("should reject get receiver if token is invalid", async () => {
    const receiver = await ReceiverTest.create({
      email: `token-test-${Date.now()}@example.com`,
    });

    const response = await supertest(web)
      .get(`/api/penerima/${receiver.id}`)
      .set("X-API-TOKEN", "wrong-token");

    logger.debug(response.body);
    expect(response.status).toBe(401);
    expect(response.body.errors).toBeDefined();
  });
});

describe("PUT /api/penerima/:id", () => {
  beforeEach(async () => {
    await ReceiverTest.deleteAll();
    await UserTest.create();
  });

  afterEach(async () => {
    await ReceiverTest.deleteAll();
    await UserTest.delete();
  });

  it("should be able to update receiver", async () => {
    const receiver = await ReceiverTest.create();

    const response = await supertest(web)
      .put(`/api/penerima/${receiver.id}`)
      .set("X-API-TOKEN", "test")
      .send({
        nama: "Updated Name",
        email: "updated@example.com",
      });

    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(response.body.data.nama).toBe("Updated Name");
    expect(response.body.data.email).toBe("updated@example.com");
  });

  it("should be able to update receiver name only", async () => {
    const receiver = await ReceiverTest.create({
      email: "test@example.com",
    });

    const response = await supertest(web)
      .put(`/api/penerima/${receiver.id}`)
      .set("X-API-TOKEN", "test")
      .send({
        nama: "Updated Name Only",
      });

    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(response.body.data.nama).toBe("Updated Name Only");
    expect(response.body.data.email).toBe(receiver.email); // Should remain the same
  });

  it("should be able to update receiver email only", async () => {
    const receiver = await ReceiverTest.create();

    const response = await supertest(web)
      .put(`/api/penerima/${receiver.id}`)
      .set("X-API-TOKEN", "test")
      .send({
        email: "updated-email@example.com",
      });

    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(response.body.data.email).toBe("updated-email@example.com");
    expect(response.body.data.nama).toBe(receiver.nama); // Should remain the same
  });

  it("should reject update receiver if email already exists", async () => {
    const receiver1 = await ReceiverTest.create({
      email: "test@example.com",
    });
    const receiver2 = await ReceiverTest.create({
      nama: "Another Receiver",
      email: "anothertest@example.com",
    });

    const response = await supertest(web)
      .put(`/api/penerima/${receiver2.id}`)
      .set("X-API-TOKEN", "test")
      .send({
        email: "test@example.com", // Trying to use existing email
      });

    logger.debug(response.body);
    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });

  it("should reject update receiver if receiver not found", async () => {
    const response = await supertest(web)
      .put("/api/penerima/9999")
      .set("X-API-TOKEN", "test")
      .send({
        nama: "Updated Name",
      });

    logger.debug(response.body);
    expect(response.status).toBe(404);
    expect(response.body.errors).toBeDefined();
  });
});

describe("DELETE /api/penerima/:id", () => {
  beforeEach(async () => {
    await UserTest.create();
  });

  afterEach(async () => {
    await ReceiverTest.deleteAll();
    await UserTest.delete();
  });

  it("should be able to delete receiver", async () => {
    const receiver = await ReceiverTest.create();

    const response = await supertest(web)
      .delete(`/api/penerima/${receiver.id}`)
      .set("X-API-TOKEN", "test");

    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(response.body.data).toBe("OK");

    const deletedReceiver = await ReceiverTest.get(receiver.id);
    expect(deletedReceiver).toBeNull();
  });

  it("should reject delete receiver if receiver not found", async () => {
    const response = await supertest(web)
      .delete("/api/penerima/9999")
      .set("X-API-TOKEN", "test");

    logger.debug(response.body);
    expect(response.status).toBe(404);
    expect(response.body.errors).toBeDefined();
  });

  it("should reject delete receiver if it has letters", async () => {
    const receiver = await ReceiverTest.create();

    // Create a letter associated with this receiver
    await prismaClient.letter.create({
      data: {
        pengirim: "Test Sender",
        tujuan: "Test Purpose",
        nomor_surat: "001/2023",
        tanggal_masuk: new Date(),
        tanggal_surat: new Date(),
        perihal: "Test Subject",
        file_url: "test.pdf",
        status: "pending",
        penerima_id: receiver.id,
      },
    });

    const response = await supertest(web)
      .delete(`/api/penerima/${receiver.id}`)
      .set("X-API-TOKEN", "test");

    await LetterTest.deleteAll();

    logger.debug(response.body);
    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });
});

describe("GET /api/penerima", () => {
  beforeEach(async () => {
    await UserTest.create();
  });

  afterEach(async () => {
    await ReceiverTest.deleteAll();
    await UserTest.delete();
  });

  it("should be able to list receivers", async () => {
    const receiver1 = await ReceiverTest.create();
    const receiver2 = await prismaClient.receiver.create({
      data: {
        nama: "Second Receiver",
        email: "second@example.com",
      },
    });

    const response = await supertest(web)
      .get("/api/penerima")
      .set("X-API-TOKEN", "test");

    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(2);
    expect(response.body.data[0].id).toBe(receiver2.id); // Should be ordered by latest first
    expect(response.body.data[1].id).toBe(receiver1.id);
    expect(response.body.meta.total).toBe(2);
  });

  it("should return empty array if no receivers", async () => {
    await ReceiverTest.deleteAll();

    const response = await supertest(web)
      .get("/api/penerima")
      .set("X-API-TOKEN", "test");

    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(0);
    expect(response.body.meta.total).toBe(0);
  });
});
