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

  beforeEach(async () => {
    await LetterTest.deleteAll();
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
        .field("tanggal_masuk", new Date("2025-12-30").toISOString())
        .field("tanggal_surat", new Date("2025-12-30").toISOString())
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
        .field("user_id", "invalid")
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
      expect(response.body.data.tanggal_masuk).toBe(
        letter.tanggal_masuk.toISOString()
      );
      expect(response.body.data.tanggal_surat).toBe(
        letter.tanggal_surat.toISOString()
      );
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
      const { nomor_registrasi } = await LetterTest.create(userId);

      const response = await supertest(web)
        .patch(`/api/surat/${nomor_registrasi}/status`)
        .set("X-API-TOKEN", userToken)
        .send({ status: "diterima" });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe("diterima");
    });

    it("should reject update by non-owner user", async () => {
      const { letter } = await LetterTest.createWithUser();

      const response = await supertest(web)
        .patch(`/api/surat/${letter.nomor_registrasi}/status`)
        .set("X-API-TOKEN", userToken)
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
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].user.id).toBe(userId);
    });
  });

  describe("GET /api/surat with month/year filter", () => {
    const testDate = new Date(2023, 5, 15);
    const testMonth = testDate.getMonth() + 1;
    const testYear = testDate.getFullYear();

    beforeAll(async () => {
      await LetterTest.deleteAll();

      await LetterTest.create(userId, {
        pengirim: "Instansi Juni 2023",
        tanggal_masuk: new Date(2023, 5, 10),
        perihal: "Surat Juni 2023",
      });

      await LetterTest.create(userId, {
        pengirim: "Instansi Mei 2023",
        tanggal_masuk: new Date(2023, 4, 10),
        perihal: "Surat Mei 2023",
      });

      await LetterTest.create(userId, {
        pengirim: "Instansi Juni 2022",
        tanggal_masuk: new Date(2022, 5, 10),
        perihal: "Surat Juni 2022",
      });
    });

    it("should filter letters by month and year (admin)", async () => {
      await LetterTest.create(userId, {
        pengirim: "Instansi Juni 2023",
        tanggal_masuk: new Date(2023, 5, 15),
        perihal: "Surat Juni 2023",
      });

      const response = await supertest(web)
        .get("/api/surat")
        .query({
          bulan: 6,
          tahun: 2023,
        })
        .set("X-API-TOKEN", adminToken);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].pengirim).toBe("Instansi Juni 2023");
    });

    it("should return empty if no letters in filtered month", async () => {
      const response = await supertest(web)
        .get("/api/surat")
        .query({ bulan: 1, tahun: testYear }) 
        .set("X-API-TOKEN", adminToken);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(0);
    });

    it("should reject invalid month parameter", async () => {
      const response = await supertest(web)
        .get("/api/surat")
        .query({ bulan: 13, tahun: testYear })
        .set("X-API-TOKEN", adminToken);

      expect(response.status).toBe(400);
      expect(response.body.errors).toContain("Month must be between 1-12");
    });

    it("should reject invalid year parameter", async () => {
      const response = await supertest(web)
        .get("/api/surat")
        .query({ bulan: testMonth, tahun: 1999 })
        .set("X-API-TOKEN", adminToken);

      expect(response.status).toBe(400);
      expect(response.body.errors).toContain("Year must be between 2000-2100");
    });

    it("should work with pagination and filtering together", async () => {
      for (let i = 0; i < 5; i++) {
        await LetterTest.create(userId, {
          pengirim: `Instansi Juni 2023 - ${i}`,
          tanggal_masuk: new Date(testYear, testMonth - 1, i + 1),
          perihal: `Surat Juni 2023 - ${i}`,
        });
      }

      const response = await supertest(web)
        .get("/api/surat")
        .query({
          bulan: testMonth,
          tahun: testYear,
          page: 2,
          limit: 2,
        })
        .set("X-API-TOKEN", adminToken);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(2);
      expect(response.body.page).toBe(2);
      expect(response.body.totalPages).toBe(3);
    });
  });

  describe("GET /api/surat/laporan-bulanan", () => {
    it("should return monthly report", async () => {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      await LetterTest.create(userId, {
        pengirim: "Instansi A",
        tanggal_masuk: new Date(currentYear, currentMonth - 1, 15),
        tanggal_surat: new Date(currentYear, currentMonth - 1, 10),
        perihal: "Surat Bulan Ini",
      });

      const response = await supertest(web)
        .get("/api/surat/laporan-bulanan")
        .query({ bulan: currentMonth, tahun: currentYear })
        .set("X-API-TOKEN", adminToken);

      logger.debug(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.bulan).toBe(currentMonth);
      expect(response.body.data.tahun).toBe(currentYear);
      expect(response.body.data.total).toBe(1);
      expect(response.body.data.surat[0].pengirim).toBe("Instansi A");
    });

    it("should reject if month is invalid", async () => {
      const response = await supertest(web)
        .get("/api/surat/laporan-bulanan")
        .query({ bulan: 13, tahun: 2023 })
        .set("X-API-TOKEN", adminToken);

      expect(response.status).toBe(400);
      expect(response.body.errors).toContain("Bulan harus antara 1-12");
    });

    it("should reject if year is invalid", async () => {
      const response = await supertest(web)
        .get("/api/surat/laporan-bulanan")
        .query({ bulan: 1, tahun: 1999 })
        .set("X-API-TOKEN", adminToken);

      expect(response.status).toBe(400);
      expect(response.body.errors).toContain("Tahun tidak valid");
    });

    it("should return empty if no data", async () => {
      const response = await supertest(web)
        .get("/api/surat/laporan-bulanan")
        .query({ bulan: 1, tahun: 2000 })
        .set("X-API-TOKEN", adminToken);

      expect(response.status).toBe(200);
      expect(response.body.data.total).toBe(0);
      expect(response.body.data.surat).toHaveLength(0);
    });
  });
});
