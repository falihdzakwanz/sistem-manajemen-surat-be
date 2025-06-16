import supertest from "supertest";
import { web } from "../src/application/web";
import { logger } from "../src/application/logging";
import { UserTest, ReceiverTest, LetterTest } from "./test-util";
import fs from "fs";

describe("Letter API", () => {
  beforeAll(async () => {
    await UserTest.create();
  });

  afterEach(async () => {
    await LetterTest.deleteAll();
    await LetterTest.cleanupFiles();
    await ReceiverTest.deleteAll();
  });

  afterAll(async () => {
    await UserTest.delete();
  });

  describe("POST /api/surat", () => {
    it("should create letter with valid PDF (under 10MB)", async () => {
      const receiver = await ReceiverTest.create();
      const testPdf = LetterTest.getTestFile("pdf"); // ~1KB PDF

      const response = await supertest(web)
        .post("/api/surat")
        .set("X-API-TOKEN", "test")
        .field("pengirim", "Kementerian Test")
        .field("tujuan", "Dinas Test")
        .field("nomor_surat", "001/2023")
        .field("tanggal_masuk", "2025-01-01")
        .field("tanggal_surat", "2025-01-01")
        .field("perihal", "Surat Test")
        .field("penerima_id", receiver.id)
        .attach("file", testPdf, "valid.pdf");

      logger.debug(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.nomor_registrasi).toBeDefined();
      expect(response.body.data.file_url).toContain("uploads");
    });

    it("should create letter with valid DOCX (under 10MB)", async () => {
      const receiver = await ReceiverTest.create();
      const testDocx = LetterTest.getTestFile("docx"); // ~1KB DOCX

      const response = await supertest(web)
        .post("/api/surat")
        .set("X-API-TOKEN", "test")
        .field("pengirim", "Kementerian Test")
        .field("tujuan", "Dinas Test")
        .field("nomor_surat", "001/2023")
        .field("tanggal_masuk", "2025-01-01")
        .field("tanggal_surat", "2025-01-01")
        .field("perihal", "Surat Test")
        .field("penerima_id", receiver.id)
        .attach("file", testDocx, "valid.docx");

      expect(response.status).toBe(200);
      expect(response.body.data.file_url).toMatch(/\.docx$/);
    });

    it("should reject invalid file type (TXT)", async () => {
      const receiver = await ReceiverTest.create();
      const textTxt = LetterTest.getTestFile("txt");

      const response = await supertest(web)
        .post("/api/surat")
        .set("X-API-TOKEN", "test")
        .field("pengirim", "Kementerian Test")
        .field("tujuan", "Dinas Test")
        .field("nomor_surat", "001/2023")
        .field("tanggal_masuk", "2025-01-01")
        .field("tanggal_surat", "2025-01-01")
        .field("perihal", "Surat Test")
        .field("penerima_id", receiver.id)
        .attach("file", textTxt, "invalid.txt");

      expect(response.status).toBe(400);
      expect(response.body.errors).toMatch(/PDF.*DOCX/i);
    });

    it("should reject file larger than 10MB", async () => {
      const receiver = await ReceiverTest.create();

      // Create a 11MB buffer quickly without writing to disk
      const largeFile = LetterTest.getLargeFile();

      const response = await supertest(web)
        .post("/api/surat")
        .set("X-API-TOKEN", "test")
        .field("pengirim", "Kementerian Test")
        .field("tujuan", "Dinas Test")
        .field("nomor_surat", "001/2023")
        .field("tanggal_masuk", "2025-01-01")
        .field("tanggal_surat", "2025-01-01")
        .field("perihal", "Surat Test")
        .field("penerima_id", receiver.id)
        .attach("file", largeFile, "large.pdf");

      expect(response.status).toBe(400);
    }, 10000); // Increase timeout to 10s if needed

    it("should reject if no file uploaded", async () => {
      const receiver = await ReceiverTest.create();

      const response = await supertest(web)
        .post("/api/surat")
        .set("X-API-TOKEN", "test")
        .field("pengirim", "Kementerian Test")
        .field("tujuan", "Dinas Test")
        .field("nomor_surat", "001/2023")
        .field("tanggal_masuk", "2025-01-01")
        .field("tanggal_surat", "2025-01-01")
        .field("perihal", "Surat Test")
        .field("penerima_id", receiver.id);
      // ... other required fields ...

      expect(response.status).toBe(400);
      expect(response.body.errors).toMatch(/file.*required/i);
    });

    it("should reject create letter if request is invalid", async () => {
      const response = await supertest(web)
        .post("/api/surat")
        .set("X-API-TOKEN", "test")
        .field("penerima_id", "invalid") // Invalid ID
        .attach("file", Buffer.from("test"), "test.pdf");

      logger.debug(response.body);
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it("should reject if token is invalid", async () => {
      const response = await supertest(web)
        .post("/api/surat")
        .set("X-API-TOKEN", "invalid-token")
        .field("pengirim", "Kementerian Test")
        .field("tujuan", "Dinas Test")
        .field("nomor_surat", "001/2023")
        .field("tanggal_masuk", "2025-01-01")
        .field("tanggal_surat", "2025-01-01")
        .field("perihal", "Surat Test")
        .field("penerima_id", "1")
        .attach("file", LetterTest.getTestFile(), "test.pdf");

      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    });

    it("should reject if token is missing", async () => {
      const response = await supertest(web)
        .post("/api/surat")
        .field("pengirim", "Kementerian Test")
        .field("tujuan", "Dinas Test")
        .field("nomor_surat", "001/2023")
        .field("tanggal_masuk", "2025-01-01")
        .field("tanggal_surat", "2025-01-01")
        .field("perihal", "Surat Test")
        .field("penerima_id", "1")
        .attach("file", LetterTest.getTestFile(), "test.pdf");

      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe("GET /api/surat/:nomor_registrasi", () => {
    it("should get letter details", async () => {
      const { letter } = await LetterTest.createWithReceiver();

      const response = await supertest(web)
        .get(`/api/surat/${letter.nomor_registrasi}`)
        .set("X-API-TOKEN", "test");

      logger.debug(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(letter.id);
      expect(response.body.data.penerima).toBeDefined();
    });

    it("should reject if letter not found", async () => {
      const response = await supertest(web)
        .get("/api/surat/9999")
        .set("X-API-TOKEN", "test");

      logger.debug(response.body);
      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    });

    it("should reject if token is invalid", async () => {
      const { letter } = await LetterTest.createWithReceiver();

      const response = await supertest(web)
        .get(`/api/surat/${letter.nomor_registrasi}`)
        .set("X-API-TOKEN", "invalid-token");

      expect(response.status).toBe(401);
    });

    it("should reject if token is missing", async () => {
      const { letter } = await LetterTest.createWithReceiver();

      const response = await supertest(web).get(
        `/api/surat/${letter.nomor_registrasi}`
      );

      expect(response.status).toBe(401);
    });
  });

  describe("PATCH /api/surat/:nomor_registrasi/status", () => {
    it("should update letter status", async () => {
      const { letter } = await LetterTest.createWithReceiver();

      const response = await supertest(web)
        .patch(`/api/surat/${letter.nomor_registrasi}/status`)
        .set("X-API-TOKEN", "test")
        .send({ status: "diterima" });

      logger.debug(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe("diterima");
    });

    it("should reject invalid status", async () => {
      const { letter } = await LetterTest.createWithReceiver();

      const response = await supertest(web)
        .patch(`/api/surat/${letter.nomor_registrasi}/status`)
        .set("X-API-TOKEN", "test")
        .send({ status: "invalid" });

      logger.debug(response.body);
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it("should reject if token is invalid", async () => {
      const { letter } = await LetterTest.createWithReceiver();

      const response = await supertest(web)
        .patch(`/api/surat/${letter.nomor_registrasi}/status`)
        .set("X-API-TOKEN", "invalid-token")
        .send({ status: "diterima" });

      expect(response.status).toBe(401);
    });

    it("should reject if token is missing", async () => {
      const { letter } = await LetterTest.createWithReceiver();

      const response = await supertest(web)
        .patch(`/api/surat/${letter.nomor_registrasi}/status`)
        .send({ status: "diterima" });

      expect(response.status).toBe(401);
    });
  });

  describe("PUT /api/surat/:nomor_registrasi", () => {
    it("should update letter details", async () => {
      const { letter } = await LetterTest.createWithReceiver();
      const testPdf = LetterTest.getTestFile();

      const response = await supertest(web)
        .put(`/api/surat/${letter.nomor_registrasi}`)
        .set("X-API-TOKEN", "test")
        .field("perihal", "Updated Subject")
        .attach("file", testPdf, "updated.pdf");

      logger.debug(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.perihal).toBe("Updated Subject");
    });

    it("should reject if token is invalid", async () => {
      const { letter } = await LetterTest.createWithReceiver();

      const response = await supertest(web)
        .put(`/api/surat/${letter.nomor_registrasi}`)
        .set("X-API-TOKEN", "invalid-token")
        .field("perihal", "Updated Subject")
        .attach("file", LetterTest.getTestFile(), "updated.pdf");

      expect(response.status).toBe(401);
    });

    it("should reject if token is missing", async () => {
      const { letter } = await LetterTest.createWithReceiver();

      const response = await supertest(web)
        .put(`/api/surat/${letter.nomor_registrasi}`)
        .field("perihal", "Updated Subject")
        .attach("file", LetterTest.getTestFile(), "updated.pdf");

      expect(response.status).toBe(401);
    });
  });

  describe("DELETE /api/surat/:nomor_registrasi", () => {
    it("should delete letter", async () => {
      const { letter } = await LetterTest.createWithReceiver();

      const response = await supertest(web)
        .delete(`/api/surat/${letter.nomor_registrasi}`)
        .set("X-API-TOKEN", "test");

      logger.debug(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data).toBe("OK");

      const deleted = await LetterTest.get(letter.id);
      expect(deleted).toBeNull();
    });

    it("should reject if token is invalid", async () => {
      const { letter } = await LetterTest.createWithReceiver();

      const response = await supertest(web)
        .delete(`/api/surat/${letter.nomor_registrasi}`)
        .set("X-API-TOKEN", "invalid-token");

      expect(response.status).toBe(401);
    });

    it("should reject if token is missing", async () => {
      const { letter } = await LetterTest.createWithReceiver();

      const response = await supertest(web).delete(
        `/api/surat/${letter.nomor_registrasi}`
      );

      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/surat/:nomor_registrasi/file", () => {
    it("should download letter file", async () => {
      const { letter } = await LetterTest.createWithReceiver();

      const response = await supertest(web)
        .get(`/api/surat/${letter.nomor_registrasi}/file`)
        .set("X-API-TOKEN", "test");

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toBe("application/pdf");
      expect(response.headers["content-disposition"]).toContain("attachment");
    });

    it("should reject download if file missing", async () => {
      const { letter } = await LetterTest.createWithReceiver();
      // Delete the file to simulate missing file
      fs.unlinkSync(letter.file_url);

      const response = await supertest(web)
        .get(`/api/surat/${letter.nomor_registrasi}/file`)
        .set("X-API-TOKEN", "test");

      expect(response.status).toBe(404);
    });

    it("should reject if token is invalid", async () => {
      const { letter } = await LetterTest.createWithReceiver();
      const response = await supertest(web)
        .get(`/api/surat/${letter.nomor_registrasi}/file`)
        .set("X-API-TOKEN", "invalid-token");
      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/surat", () => {
    it("should list all letters", async () => {
      await LetterTest.createWithReceiver();
      await LetterTest.createWithReceiver();

      const response = await supertest(web)
        .get("/api/surat")
        .set("X-API-TOKEN", "test");

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(2);
    });

    it("should reject if token is invalid", async () => {
      const response = await supertest(web)
        .get("/api/surat")
        .set("X-API-TOKEN", "invalid-token");
      expect(response.status).toBe(401);
    });
  });
});
