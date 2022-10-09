import { Inject, Logger } from '@nestjs/common';
import { Injectable } from '@nestjs/common/decorators/core/injectable.decorator';
import * as bluebird from 'bluebird';
import * as firebaseAdmin from 'firebase-admin';
import {
  PushConfigs,
  PUSH_CONFIGS,
} from '../interfaces/push-configs.interface';

@Injectable()
export class PushService {
  private firebaseAdmin: firebaseAdmin.app.App;

  constructor(
    @Inject(PUSH_CONFIGS) private pushProvider: PushConfigs,
    private readonly logger: Logger,
  ) {
    if (firebaseAdmin.apps.length === 0) {
      this.firebaseAdmin = firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert(
          this.pushProvider.serviceJsonPath,
        ),
      });
    }
  }

  /**
   * Sends the given message via FCM topic.
   *
   * @param topic The message topic.
   * @param payload The message payload.
   * @param imageUrl The message image.
   *   (validation only) mode.
   * @return A promise fulfilled with a unique message ID
   *   string after the message has been successfully handed off to the FCM
   *   service for delivery.
   */
  async sendToDevices(
    deviceTokens: [],
    payload: firebaseAdmin.messaging.MessagingPayload,
    imageUrl?: string,
  ): Promise<{
    failureCount: number;
    successCount: number;
    failedDeviceTokens: string[];
  }> {
    if (deviceTokens.length === 0) {
      throw new Error('You provide an empty device ids list!');
    }

    const body: firebaseAdmin.messaging.MulticastMessage = {
      tokens: deviceTokens,
      data: payload?.data,
      notification: {
        title: payload?.notification?.title,
        body: payload?.notification?.body,
        imageUrl,
      },
      apns: {
        payload: {
          aps: {
            sound: payload?.notification?.sound,
            contentAvailable: false,
            mutableContent: true,
          },
        },
        fcmOptions: {
          imageUrl,
        },
      },
      android: {
        priority: 'high',
        ttl: 60 * 60 * 24,
        notification: {
          sound: payload?.notification?.sound,
        },
      },
    };

    let failureCount = 0;
    let successCount = 0;
    const failedDeviceTokens = [];

    while (deviceTokens.length) {
      try {
        const result: firebaseAdmin.messaging.BatchResponse =
          await this.firebaseAdmin
            .messaging()
            .sendMulticast(
              { ...body, tokens: deviceTokens.splice(0, 500) },
              false,
            );

        if (result.failureCount > 0) {
          const failedTokens = [];

          await bluebird.map(result.responses, (resp, id) => {
            if (!resp.success) {
              failedTokens.push(deviceTokens[id]);
            }
          });

          failedDeviceTokens.push(...failedTokens);
        }

        failureCount += result.failureCount;
        successCount += result.successCount;
      } catch (error) {
        this.logger.error(error.message, error.stackTrace, 'nestjs-push');
        throw error;
      }
    }

    return { failureCount, successCount, failedDeviceTokens };
  }

  /**
   * Sends the given message via FCM topic.
   *
   * @param topic The message topic.
   * @param payload The message payload.
   * @param imageUrl The message image.
   *   (validation only) mode.
   * @return A promise fulfilled with a unique message ID
   *   string after the message has been successfully handed off to the FCM
   *   service for delivery.
   */
  async sendToTopics(
    topic: string,
    payload: firebaseAdmin.messaging.MessagingPayload,
    imageUrl?: string,
  ): Promise<string> {
    if (!topic) {
      throw new Error('You provide no topic for messaging');
    }

    const body: firebaseAdmin.messaging.TopicMessage = {
      topic,
      data: payload?.data,
      notification: {
        title: payload?.notification?.title,
        body: payload?.notification?.body,
        imageUrl,
      },
      apns: {
        payload: {
          aps: {
            sound: payload?.notification?.sound,
            contentAvailable: false,
            mutableContent: true,
          },
        },
        fcmOptions: {
          imageUrl,
        },
      },
      android: {
        priority: 'high',
        ttl: 60 * 60 * 24,
        notification: {
          sound: payload?.notification?.sound,
        },
      },
    };

    try {
      return await this.firebaseAdmin.messaging().send(body);
    } catch (error) {
      this.logger.error(error.message, error.stackTrace, 'nestjs-push');
      throw error;
    }
  }
}
