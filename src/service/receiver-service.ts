import {
  CreateReceiverRequest,
  ReceiverResponse,
  ReceiverWithLetters,
  toReceiverResponse,
  UpdateReceiverRequest,
} from "../model/receiver-model";
import { Validation } from "../validation/validation";
import { ReceiverValidation } from "../validation/receiver-validation";
import { prismaClient } from "../application/database";
import { ResponseError } from "../error/response-error";

export class ReceiverService {
  static async create(
    request: CreateReceiverRequest
  ): Promise<ReceiverResponse> {
    const createRequest = Validation.validate(
      ReceiverValidation.CREATE,
      request
    );

    const emailExists = await prismaClient.receiver.count({
      where: {
        email: createRequest.email,
      },
    });

    if (emailExists !== 0) {
      throw new ResponseError(400, "Email already exists");
    }

    const receiver = await prismaClient.receiver.create({
      data: createRequest,
    });

    return toReceiverResponse(receiver);
  }

  static async update(
    id: number,
    request: UpdateReceiverRequest
  ): Promise<ReceiverResponse> {
    const updateRequest = Validation.validate(
      ReceiverValidation.UPDATE,
      request
    );

    const receiverExists = await prismaClient.receiver.count({
      where: {
        id: id,
      },
    });

    if (!receiverExists) {
      throw new ResponseError(404, "Receiver not found");
    }

    if (updateRequest.email) {
      const emailExists = await prismaClient.receiver.count({
        where: {
          email: updateRequest.email,
          NOT: {
            id: id,
          },
        },
      });

      if (emailExists !== 0) {
        throw new ResponseError(400, "Email already exists");
      }
    }

    const updatedReceiver = await prismaClient.receiver.update({
      where: {
        id: id,
      },
      data: updateRequest,
    });

    return toReceiverResponse(updatedReceiver);
  }

  static async delete(id: number): Promise<void> {
    const receiverExists = await prismaClient.receiver.count({
      where: {
        id: id,
      },
    });

    if (!receiverExists) {
      throw new ResponseError(404, "Receiver not found");
    }

    const hasLetters = await prismaClient.letter.count({
      where: {
        penerima_id: id,
      },
    });

    if (hasLetters > 0) {
      throw new ResponseError(
        400,
        `Cannot delete receiver as it has ${hasLetters} associated letters`
      );
    }

    await prismaClient.receiver.delete({
      where: {
        id: id,
      },
    });
  }

  static async get(id: number): Promise<ReceiverWithLetters> {
    const receiver = await prismaClient.receiver.findUnique({
      where: {
        id: id,
      },
      include: {
        letters: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    if (!receiver) {
      throw new ResponseError(404, "Receiver not found");
    }

    const totalLetters = await prismaClient.letter.count({
      where: {
        penerima_id: id,
      },
    });

    const response = toReceiverResponse(receiver) as ReceiverWithLetters;
    response.total_surat = totalLetters;
    response.surat_terakhir = receiver.letters[0]?.createdAt || null;

    return response;
  }

  static async list(): Promise<Array<ReceiverWithLetters>> {
    const receivers = await prismaClient.receiver.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            letters: true,
          },
        },
        letters: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    return receivers.map((receiver) => {
      const response = toReceiverResponse(receiver) as ReceiverWithLetters;
      response.total_surat = receiver._count.letters;
      response.surat_terakhir = receiver.letters[0]?.createdAt || null;
      return response;
    });
  }
}
