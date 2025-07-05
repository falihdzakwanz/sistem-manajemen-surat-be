import { UserTest, LetterTest } from "./test-util";
import { User } from "@prisma/client";
import supertest from "supertest";
import { web } from "../src/application/web";

describe("DashboardService", () => {
  let adminUser: User;
  let regularUser: User;
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    await UserTest.deleteAll();
    adminUser = await UserTest.create({
      email_instansi: "admin@test.go.id",
      nama_instansi: "Admin",
      password: "admin123",
      role: "admin",
    });

    adminToken = await UserTest.getToken("admin@test.go.id");

    regularUser = await UserTest.create({
      email_instansi: "user@test.go.id",
      nama_instansi: "Regular User",
      password: "user123",
    });

    userToken = await UserTest.getToken("user@test.go.id");
  });

  beforeEach(async () => {
    await LetterTest.deleteAll();
  });

  afterAll(async () => {
    await UserTest.deleteAll();
  });

  describe("GET /api/dashboard/admin", () => {
    it("should return admin dashboard statistics", async () => {
      await LetterTest.create(regularUser.id);
      await LetterTest.create(regularUser.id);

      const response = await supertest(web)
        .get("/api/dashboard/admin")
        .set("X-API-TOKEN", adminToken);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();

      const stats = response.body.data;
      expect(stats.totalSurat).toBe(2);
      expect(stats.totalUsers).toBe(2);
      expect(stats.recentLetters.length).toBe(2);
      expect(stats.recentLetters[0]).toHaveProperty("id");
      expect(stats.recentLetters[0]).toHaveProperty("nomor_surat");
      expect(stats.recentLetters[0]).toHaveProperty(
        "nama_instansi",
        regularUser.nama_instansi
      );
    });

    it("should return empty stats when no data exists", async () => {
      const response = await supertest(web)
        .get("/api/dashboard/admin")
        .set("X-API-TOKEN", adminToken);

      expect(response.status).toBe(200);
      const stats = response.body.data;
      expect(stats.totalSurat).toBe(0);
      expect(stats.totalUsers).toBe(2);
      expect(stats.recentLetters.length).toBe(0);
    });

    it("should reject if not admin", async () => {
      const response = await supertest(web)
        .get("/api/dashboard/admin")
        .set("X-API-TOKEN", userToken);

      expect(response.status).toBe(403);
    });
  });

  describe("GET /api/dashboard/user", () => {
    it("should return user-specific statistics", async () => {
      await LetterTest.create(regularUser.id);
      await LetterTest.create(regularUser.id);
      await LetterTest.create(regularUser.id);


      const otherUser = await UserTest.create({
        email_instansi: "other@test.go.id",
        nama_instansi: "Other User",
        password: "other123",
      });
      await LetterTest.create(otherUser.id);

      const response = await supertest(web)
        .get("/api/dashboard/user")
        .set("X-API-TOKEN", userToken);

      expect(response.status).toBe(200);
      const stats = response.body.data;
      expect(stats.totalSurat).toBe(3);
      expect(stats.recentLetters.length).toBe(3);
      expect(stats.recentLetters[0].nama_instansi).toBe(
        regularUser.nama_instansi
      );


      const otherUserLetters = stats.recentLetters.filter(
        (letter: any) => letter.nama_instansi === otherUser.nama_instansi
      );
      expect(otherUserLetters.length).toBe(0);
    });

    it("should return empty stats when user has no letters", async () => {
      const response = await supertest(web)
        .get("/api/dashboard/user")
        .set("X-API-TOKEN", userToken);

      expect(response.status).toBe(200);
      const stats = response.body.data;
      expect(stats.totalSurat).toBe(0);
      expect(stats.recentLetters.length).toBe(0);
    });

    it("should limit recent letters to 5", async () => {

      for (let i = 0; i < 6; i++) {
        await LetterTest.create(regularUser.id);
      }

      const response = await supertest(web)
        .get("/api/dashboard/user")
        .set("X-API-TOKEN", userToken);

      expect(response.status).toBe(200);
      const stats = response.body.data;
      expect(stats.totalSurat).toBe(6);
      expect(stats.recentLetters.length).toBe(5);
    });
  });
});
