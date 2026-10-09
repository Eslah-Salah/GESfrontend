import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CreatePropertyDto } from './dto/create-property.dto';
import { StartAccessHoldDto } from './dto/start-access-hold.dto';
import {
  PropertyAction,
  PropertyLog,
  PropertyRecord,
} from './property.types';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

@Injectable()
export class PropertiesService implements OnModuleInit, OnModuleDestroy {
  private readonly properties: PropertyRecord[] = [
    {
      id: 'palm-court',
      name: 'Palm Court Hotel',
      nameAr: 'فندق بالم كورت',
      type: 'Hotel',
      status: 'Approved',
      plan: 'Enterprise',
      users: 18,
      details: {
        cr: '1010448210',
        tax: '310884215700003',
        phone: '+966 11 488 2200',
        fax: '+966 11 488 2201',
        email: 'hello@palmcourt.example',
        city: 'Riyadh',
        address: 'King Fahd Road, Al Olaya',
        languages: 'Arabic, English',
        openingDays: 'Sunday–Thursday',
      },
      accessEndsAt: null,
      holdStarted: false,
      holdStartedAt: null,
      logs: [
        {
          at: Date.now() - 2 * DAY,
          person: 'Super Admin',
          action: 'Property approved',
          reason: 'Registration verified.',
        },
      ],
    },
    {
      id: 'atlas-travel',
      name: 'Atlas Travel Co.',
      nameAr: 'أطلس للسفر والسياحة',
      type: 'Travel agency',
      status: 'Pending',
      plan: 'Starter',
      users: 4,
      details: {
        cr: '1010935772',
        tax: '310945667300003',
        phone: '+966 12 677 3400',
        fax: '—',
        email: 'team@atlas.example',
        city: 'Jeddah',
        address: 'Prince Sultan Street',
        languages: 'Arabic, English, French',
        openingDays: 'Sunday–Thursday',
      },
      accessEndsAt: null,
      holdStarted: false,
      holdStartedAt: null,
      logs: [
        {
          at: Date.now() - 3 * HOUR,
          person: 'Super Admin',
          action: 'Registration submitted',
          reason: '',
        },
      ],
    },
    {
      id: 'desert-rose',
      name: 'Desert Rose Resort',
      nameAr: 'منتجع ديزرت روز',
      type: 'Hotel',
      status: 'Suspended',
      plan: 'Professional',
      users: 11,
      details: {
        cr: '1010702194',
        tax: '310710219400003',
        phone: '+966 17 222 8040',
        fax: '+966 17 222 8041',
        email: 'stay@desertrose.example',
        city: 'Abha',
        address: 'Abha Mountain Road',
        languages: 'Arabic, English',
        openingDays: 'Daily',
      },
      accessEndsAt: null,
      holdStarted: false,
      holdStartedAt: null,
      logs: [
        {
          at: Date.now() - 8 * HOUR,
          person: 'Super Admin',
          action: 'Access suspended',
          reason: 'Awaiting updated compliance documents.',
        },
      ],
    },
    {
      id: 'cedar-house',
      name: 'Cedar House Hotel',
      nameAr: 'فندق سيدار هاوس',
      type: 'Hotel',
      status: 'Rejected',
      plan: 'Starter',
      users: 2,
      details: {
        cr: '1010229081',
        tax: '310220908100003',
        phone: '+966 13 850 1090',
        fax: '—',
        email: 'contact@cedarhouse.example',
        city: 'Dammam',
        address: 'Corniche Road',
        languages: 'Arabic, English',
        openingDays: 'Daily',
      },
      accessEndsAt: null,
      holdStarted: false,
      holdStartedAt: null,
      logs: [
        {
          at: Date.now() - 5 * DAY,
          person: 'Super Admin',
          action: 'Registration rejected',
          reason: 'The submitted registration details could not be verified.',
        },
      ],
    },
  ];

  private expiryTimer: NodeJS.Timeout | undefined;

  onModuleInit(): void {
    this.expiryTimer = setInterval(() => this.restoreExpiredHolds(), 30_000);
  }

  onModuleDestroy(): void {
    if (this.expiryTimer) clearInterval(this.expiryTimer);
  }

  findAll(): PropertyRecord[] {
    this.restoreExpiredHolds();
    return this.properties;
  }

  create(dto: CreatePropertyDto): PropertyRecord {
    const property: PropertyRecord = {
      id: `property-${randomUUID()}`,
      name: dto.businessEn.trim(),
      nameAr: dto.businessAr.trim(),
      type: dto.type,
      status: 'Pending',
      plan: 'Starter',
      users: 1,
      details: {
        cr: dto.cr.trim(),
        tax: dto.tax.trim(),
        phone: dto.phone.trim(),
        fax: dto.fax?.trim() || '—',
        email: dto.email.trim(),
        city: dto.city.trim(),
        address: dto.address.trim(),
        languages: dto.languages.trim(),
        openingDays: dto.openingDays.trim(),
      },
      accessEndsAt: null,
      holdStarted: false,
      holdStartedAt: null,
      logs: [this.createLog('Property owner', 'Registration submitted')],
    };
    this.properties.unshift(property);
    return property;
  }

  changeStatus(id: string, action: PropertyAction): PropertyRecord {
    const property = this.findById(id);
    const nextStatus = {
      Approve: 'Approved',
      Reject: 'Rejected',
      Suspend: 'Suspended',
      'Turn back on': 'Approved',
    } as const;
    const logAction = {
      Approve: 'Property approved',
      Reject: 'Registration rejected',
      Suspend: 'Access suspended',
      'Turn back on': 'Access turned back on',
    } as const;

    property.status = nextStatus[action];
    property.holdStarted = false;
    property.accessEndsAt = null;
    property.holdStartedAt = null;
    property.logs.unshift(this.createLog('Super Admin', logAction[action]));
    return property;
  }

  startAccessHold(id: string, dto: StartAccessHoldDto): PropertyRecord {
    const property = this.findById(id);
    const reason = dto.reason.trim();
    if (!reason) {
      throw new BadRequestException('A reason is required to start an access hold.');
    }

    const now = Date.now();
    property.status = 'Suspended';
    property.holdStarted = true;
    property.holdStartedAt = now;
    property.accessEndsAt = now + dto.duration * HOUR;
    property.logs.unshift(
      this.createLog('Super Admin', 'Timed access hold started', reason),
    );
    return property;
  }

  private findById(id: string): PropertyRecord {
    const property = this.properties.find((item) => item.id === id);
    if (!property) {
      throw new NotFoundException(`Property "${id}" was not found.`);
    }
    return property;
  }

  private createLog(
    person: string,
    action: string,
    reason = '',
  ): PropertyLog {
    return { at: Date.now(), person, action, reason };
  }

  private restoreExpiredHolds(): void {
    const now = Date.now();
    for (const property of this.properties) {
      if (
        property.holdStarted &&
        property.accessEndsAt !== null &&
        property.accessEndsAt <= now
      ) {
        property.status = 'Approved';
        property.holdStarted = false;
        property.accessEndsAt = null;
        property.holdStartedAt = null;
        property.logs.unshift(
          this.createLog(
            'Super Admin',
            'Timed access hold ended — access restored',
          ),
        );
      }
    }
  }
}
