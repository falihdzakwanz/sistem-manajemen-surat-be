import supertest from "supertest";
import { web } from "../src/application/web";
import { logger } from "../src/application/logging";
import { UserTest } from "./test-util";
import { UserRole } from "@prisma/client";

describe("User API", () => {
  const testUser = {
    email_instansi: "test@instansi.go.id",
    nama_instansi: "Test Instansi",
    password: "testpassword123",
  };

  const adminUser = {
    email_instansi: "admin@instansi.go.id",
    nama_instansi: "Admin Instansi",
    password: "adminpassword123",
    role: "admin" as UserRole,
  };

  let adminToken: string;

  beforeEach(async () => {
    await UserTest.deleteAll();
    adminToken = await UserTest.createAdminToken();
  });

  afterEach(async () => {
    await UserTest.deleteAll();
  });

  describe("POST /api/users (Register)", () => {
    it("should register new user", async () => {
      const response = await supertest(web)
        .post("/api/users")
        .set("X-API-TOKEN", adminToken)
        .send(testUser);

      logger.debug(response.body);
      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data.email_instansi).toBe(testUser.email_instansi);
      expect(response.body.data.nama_instansi).toBe(testUser.nama_instansi);
      expect(response.body.data.role).toBe("user");
    });

    it("should reject duplicate email", async () => {
      await UserTest.create(testUser);

      const response = await supertest(web)
        .post("/api/users")
        .set("X-API-TOKEN", adminToken)
        .send(testUser);

      logger.debug(response.body);
      expect(response.status).toBe(400);
      expect(response.body.errors).toContain("already registered");
    });

    it("should reject invalid input", async () => {
      const response = await supertest(web)
        .post("/api/users")
        .set("X-API-TOKEN", adminToken)
        .send({
          email_instansi: "invalid",
          password: "short",
          nama_instansi: "",
        });

      logger.debug(response.body);
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe("POST /api/users/login", () => {
    beforeEach(async () => {
      await UserTest.create(testUser);
    });

    it("should login with valid credentials", async () => {
      const response = await supertest(web).post("/api/users/login").send({
        email_instansi: testUser.email_instansi,
        password: testUser.password,
      });

      logger.debug(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email_instansi).toBe(
        testUser.email_instansi
      );
    });

    it("should reject invalid password", async () => {
      const response = await supertest(web).post("/api/users/login").send({
        email_instansi: testUser.email_instansi,
        password: "wrongpassword",
      });

      logger.debug(response.body);
      expect(response.status).toBe(401);
      expect(response.body.errors).toContain("Invalid credentials");
    });

    it("should reject non-existent email", async () => {
      const response = await supertest(web).post("/api/users/login").send({
        email_instansi: "nonexistent@instansi.go.id",
        password: "anypassword",
      });

      logger.debug(response.body);
      expect(response.status).toBe(401);
      expect(response.body.errors).toContain("Invalid credentials");
    });
  });

  describe("GET /api/users/current", () => {
    let token: string;

    beforeEach(async () => {
      await UserTest.create(testUser);
      token = await UserTest.getToken(testUser.email_instansi);
    });

    it("should get current user with valid token", async () => {
      const response = await supertest(web)
        .get("/api/users/current")
        .set("X-API-TOKEN", token);

      logger.debug(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.email_instansi).toBe(testUser.email_instansi);
    });

    it("should reject without token", async () => {
      const response = await supertest(web).get("/api/users/current");

      logger.debug(response.body);
      expect(response.status).toBe(401);
    });

    it("should reject with invalid token", async () => {
      const response = await supertest(web)
        .get("/api/users/current")
        .set("X-API-TOKEN", "invalid");

      logger.debug(response.body);
      expect(response.status).toBe(401);
    });
  });

  describe("PATCH /api/users/current", () => {
    let token: string;

    beforeEach(async () => {
      await UserTest.create(testUser);
      token = await UserTest.getToken(testUser.email_instansi);
    });

    it("should update user profile", async () => {
      const newName = "Updated Instansi Name";
      const response = await supertest(web)
        .patch("/api/users/current")
        .set("X-API-TOKEN", token)
        .send({ nama_instansi: newName });

      logger.debug(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.nama_instansi).toBe(newName);
    });

    it("should update password", async () => {
      const newPassword = "newpassword123";
      const response = await supertest(web)
        .patch("/api/users/current")
        .set("X-API-TOKEN", token)
        .send({ password: newPassword });

      logger.debug(response.body);
      expect(response.status).toBe(200);

      const loginResponse = await supertest(web).post("/api/users/login").send({
        email_instansi: testUser.email_instansi,
        password: newPassword,
      });

      expect(loginResponse.status).toBe(200);
    });

    it("should reject invalid updates", async () => {
      const response = await supertest(web)
        .patch("/api/users/current")
        .set("X-API-TOKEN", token)
        .send({ nama_instansi: "" });

      logger.debug(response.body);
      expect(response.status).toBe(400);
    });
  });

  describe("Admin Endpoints", () => {
    let userToken: string;

    beforeEach(async () => {
      await UserTest.create(testUser);
      userToken = await UserTest.getToken(testUser.email_instansi);
    });

    describe("GET /api/users", () => {
      it("should list all users for admin", async () => {
        const response = await supertest(web)
          .get("/api/users")
          .set("X-API-TOKEN", adminToken);

        logger.debug(response.body);
        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(2);
        expect(response.body.meta.total).toBe(2);
      });

      it("should reject for non-admin users", async () => {
        const response = await supertest(web)
          .get("/api/users")
          .set("X-API-TOKEN", userToken);

        logger.debug(response.body);
        expect(response.status).toBe(403);
      });
    });

    describe("GET /api/users/:id", () => {
      it("should get user by id for admin", async () => {
        const user = await UserTest.getUser(testUser.email_instansi);

        const response = await supertest(web)
          .get(`/api/users/${user.id}`)
          .set("X-API-TOKEN", adminToken);

        logger.debug(response.body);
        expect(response.status).toBe(200);
        expect(response.body.data.id).toBe(user.id);
        expect(response.body.data.email_instansi).toBe(testUser.email_instansi);
        expect(response.body.data.nama_instansi).toBe(testUser.nama_instansi);
        expect(response.body.data.role).toBe("user");
        expect(response.body.data.total_surat).toBe(0);
      });

      it("should reject for non-admin users", async () => {
        const user = await UserTest.getUser(testUser.email_instansi);

        const response = await supertest(web)
          .get(`/api/users/${user.id}`)
          .set("X-API-TOKEN", userToken);

        logger.debug(response.body);
        expect(response.status).toBe(403);
      });

      it("should return 404 for non-existent user", async () => {
        const nonExistentId = 999999;

        const response = await supertest(web)
          .get(`/api/users/${nonExistentId}`)
          .set("X-API-TOKEN", adminToken);

        logger.debug(response.body);
        expect(response.status).toBe(404);
        expect(response.body.errors).toContain("User not found");
      });

      it("should include total_surat count", async () => {
        const user = await UserTest.getUser(testUser.email_instansi);
        await UserTest.createLetterForUser(user.id);

        const response = await supertest(web)
          .get(`/api/users/${user.id}`)
          .set("X-API-TOKEN", adminToken);

        logger.debug(response.body);
        expect(response.status).toBe(200);
        expect(response.body.data.total_surat).toBe(1);
      });
    });

    describe("PATCH /api/users/:id", () => {
      it("should update user profile", async () => {
        const user = await UserTest.getUser(testUser.email_instansi);

        const newName = "Updated Instansi Name Using Admin";
        const response = await supertest(web)
          .patch(`/api/users/${user.id}`)
          .set("X-API-TOKEN", adminToken)
          .send({ nama_instansi: newName });

        logger.debug(response.body);
        expect(response.status).toBe(200);
        expect(response.body.data.nama_instansi).toBe(newName);
      });

      it("should update password", async () => {
        const user = await UserTest.getUser(testUser.email_instansi);

        const newPassword = "newpassword123";
        const response = await supertest(web)
          .patch(`/api/users/${user.id}`)
          .set("X-API-TOKEN", adminToken)
          .send({ password: newPassword });

        logger.debug(response.body);
        expect(response.status).toBe(200);

        const loginResponse = await supertest(web)
          .post("/api/users/login")
          .send({
            email_instansi: testUser.email_instansi,
            password: newPassword,
          });

        expect(loginResponse.status).toBe(200);
      });

      it("should reject invalid updates", async () => {
        const user = await UserTest.getUser(testUser.email_instansi);

        const response = await supertest(web)
          .patch(`/api/users/${user.id}`)
          .set("X-API-TOKEN", adminToken)
          .send({ nama_instansi: "" });

        logger.debug(response.body);
        expect(response.status).toBe(400);
      });

      it("should reject non-admin users", async () => {
        const user = await UserTest.getUser(testUser.email_instansi);

        const newName = "Updated Instansi Name Using Admin";
        const response = await supertest(web)
          .patch(`/api/users/${user.id}`)
          .set("X-API-TOKEN", userToken)
          .send({ nama_instansi: newName });

        logger.debug(response.body);
        expect(response.status).toBe(403);
      });
    });

    describe("DELETE /api/users/:id", () => {
      it("should delete user for admin", async () => {
        const userToDelete = await UserTest.getUser(testUser.email_instansi);

        const response = await supertest(web)
          .delete(`/api/users/${userToDelete.id}`)
          .set("X-API-TOKEN", adminToken);

        logger.debug(response.body);
        expect(response.status).toBe(200);

        const users = await UserTest.listUsers();
        expect(users.length).toBe(1);
      });

      it("should reject delete for non-admin", async () => {
        const userToDelete = await UserTest.getUser(testUser.email_instansi);

        const response = await supertest(web)
          .delete(`/api/users/${userToDelete.id}`)
          .set("X-API-TOKEN", userToken);

        logger.debug(response.body);
        expect(response.status).toBe(403);
      });

      it("should reject delete if user has letters", async () => {
        const user = await UserTest.getUser(testUser.email_instansi);
        await UserTest.createLetterForUser(user.id);

        const response = await supertest(web)
          .delete(`/api/users/${user.id}`)
          .set("X-API-TOKEN", adminToken);

        logger.debug(response.body);
        expect(response.status).toBe(400);
        expect(response.body.errors).toContain("letters are assigned");
      });
    });
  });
});
