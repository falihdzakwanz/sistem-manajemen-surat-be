import supertest from "supertest";
import { web } from "../src/application/web";
import { logger } from "../src/application/logging";
import { UserTest, LetterTest } from "./test-util";

describe("Letter API", () => {
  let adminToken: string;
  let userToken: string;
  let testUser: any;
  let userId: number;

  beforeAll(async () => {
    await UserTest.deleteAll();
    adminToken = await UserTest.createAdminToken();
    testUser = {
      email_instansi: "test@instansi.go.id",
      nama_instansi: "Test Instansi",
      password: "testpassword123",
    };
    await UserTest.create(testUser);
    userToken = await UserTest.getToken(testUser.email_instansi);
    userId = (await UserTest.getUser(testUser.email_instansi)).id;
  });

  afterEach(async () => {
    await LetterTest.deleteAll();
    await LetterTest.cleanupFiles();
  });

  afterAll(async () => {
    await UserTest.deleteAll();
  });

  describe("POST /api/surat", () => {
    it("should create letter with valid PDF (under 10MB)", async () => {
      const response = await supertest(web)
        .post("/api/surat")
        .set("X-API-TOKEN", adminToken)
        .field("pengirim", "Kementerian Test")
        .field("nomor_surat", "001/2023")
        .field("tanggal_masuk", "30-12-2025")
        .field("tanggal_surat", "30-12-2025")
        .field("perihal", "Surat Test")
        .field("user_id", userId)
        .attach("file", LetterTest.getTestFile("pdf"), "valid.pdf");

      logger.debug(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.nomor_registrasi).toBeDefined();
      expect(response.body.data.file_url).toContain("uploads");
    });

    it("should reject create letter if request is invalid", async () => {
      const response = await supertest(web)
        .post("/api/surat")
        .set("X-API-TOKEN", adminToken)
        .field("user_id", "invalid") // Invalid ID
        .attach("file", Buffer.from("test"), "test.pdf");

      logger.debug(response.body);
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe("GET /api/surat/:nomor_registrasi", () => {
    it("should get letter details", async () => {
      const { user, letter } = await LetterTest.createWithUser();

      const response = await supertest(web)
        .get(`/api/surat/${letter.nomor_registrasi}`)
        .set("X-API-TOKEN", adminToken);

      logger.debug(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(letter.id);
      expect(response.body.data.pengirim).toBe(letter.pengirim);
      expect(response.body.data.nomor_surat).toBe(letter.nomor_surat);
      expect(response.body.data.tanggal_masuk).toBe(letter.tanggal_masuk);
      expect(response.body.data.tanggal_surat).toBe(letter.tanggal_surat);
      expect(response.body.data.perihal).toBe(letter.perihal);
      expect(response.body.data.nomor_registrasi).toBe(letter.nomor_registrasi);
      expect(response.body.data.file_url).toBe(letter.file_url);
      expect(response.body.data.status).toBe(letter.status);
      const responseCreatedAt = new Date(response.body.data.created_at);
      const responseUpdatedAt = new Date(response.body.data.updated_at);
      expect(responseCreatedAt).toEqual(letter.created_at);
      expect(responseUpdatedAt).toEqual(letter.updated_at);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.id).toBe(user.id);
      expect(response.body.data.user.nama_instansi).toBe(user.nama_instansi);
      expect(response.body.data.user.email_instansi).toBe(user.email_instansi);
    });
  });

  describe("PATCH /api/surat/:nomor_registrasi/status", () => {
    it("should update letter status by owner user", async () => {
      const { nomor_registrasi } = await LetterTest.create(userId); // Surat milik user biasa

      const response = await supertest(web)
        .patch(`/api/surat/${nomor_registrasi}/status`)
        .set("X-API-TOKEN", userToken) 
        .send({ status: "diterima" });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe("diterima");
    });

    it("should reject update by non-owner user", async () => {
      const { letter } = await LetterTest.createWithUser(); // Surat milik user lain

      const response = await supertest(web)
        .patch(`/api/surat/${letter.nomor_registrasi}/status`)
        .set("X-API-TOKEN", userToken) // User biasa mencoba update surat orang lain
        .send({ status: "diterima" });

      expect(response.status).toBe(403);
    });
  });

  describe("PUT /api/surat/:nomor_registrasi", () => {
    it("should update letter details", async () => {
      const { letter } = await LetterTest.createWithUser();
      const testPdf = LetterTest.getTestFile();

      const response = await supertest(web)
        .put(`/api/surat/${letter.nomor_registrasi}`)
        .set("X-API-TOKEN", adminToken)
        .field("perihal", "Updated Subject")
        .attach("file", testPdf, "updated.pdf");

      logger.debug(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.perihal).toBe("Updated Subject");
    });
  });

  describe("DELETE /api/surat/:nomor_registrasi", () => {
    it("should delete letter", async () => {
      const { letter } = await LetterTest.createWithUser();

      const response = await supertest(web)
        .delete(`/api/surat/${letter.nomor_registrasi}`)
        .set("X-API-TOKEN", adminToken);

      logger.debug(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data).toBe("OK");

      const deleted = await LetterTest.get(letter.id);
      expect(deleted).toBeNull();
    });
  });

  describe("GET /api/surat/:nomor_registrasi/file", () => {
    it("should download letter file", async () => {
      const { letter } = await LetterTest.createWithUser();

      const response = await supertest(web)
        .get(`/api/surat/${letter.nomor_registrasi}/file`)
        .set("X-API-TOKEN", adminToken);

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toBe("application/pdf");
      expect(response.headers["content-disposition"]).toContain("attachment");
    });
  });

  describe("GET /api/surat", () => {
    it("should list all letters for admin", async () => {
      await LetterTest.createWithUser();
      await LetterTest.createWithUser();

      const response = await supertest(web)
        .get("/api/surat")
        .set("X-API-TOKEN", adminToken);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(2);
    });
  });

  describe("GET /api/surat/me", () => {
    it("should list ONLY user's own letters for regular user", async () => {
      await LetterTest.create(userId);
      await LetterTest.createWithUser();

      const response = await supertest(web)
        .get("/api/surat/me")
        .set("X-API-TOKEN", userToken);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1); // Hanya 1 surat (miliknya sendiri)
      expect(response.body.data[0].user.id).toBe(userId); // Memastikan data yang kembali adalah miliknya
    });
  });
});
