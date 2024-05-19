import { ConsoleLogger, Injectable } from '@nestjs/common';
import { cloneDeep } from 'lodash';
import { Department } from 'src/entities/department.entity';
import { Donation } from 'src/entities/donation.entity';
import { Employee } from 'src/entities/employee.entity';
import { Rate } from 'src/entities/rate.entity';
import { Statement } from 'src/entities/statement.entity';
import { objectIsNotEmpty, readLineByLine } from 'src/utils';
import { DataSource } from 'typeorm';

const DEFAULT_CURRENCY = 'USD';

const BLACK_LIST_ENTITIES = ['E-List', 'Salary', 'Rates'];

const ENTITY_NAME = {
  Employee: 'employee',
  Department: 'department',
  Statement: 'statement',
  Donation: 'donation',
  Rate: 'rate',
};

function entityParser() {
  const initialState = {
    [ENTITY_NAME.Employee]: {},
    [ENTITY_NAME.Department]: {},
    [ENTITY_NAME.Statement]: [],
    [ENTITY_NAME.Donation]: [],
    [ENTITY_NAME.Rate]: [],
  };

  let entities: { [x: string]: any } = cloneDeep(initialState);

  let currentEntity;
  let currentIndex;

  return {
    getData: () => entities,
    hasEmployee: () => entities.employee.hasOwnProperty('id'),
    setEntity: (name) => {
      if (name === currentEntity) {
        currentIndex++;
        entities[currentEntity][currentIndex] = {};
        return;
      }

      currentEntity = name;
      if (Array.isArray(entities[currentEntity])) {
        currentIndex = 0;
        entities[currentEntity][currentIndex] = {};
      }
    },
    setProperty(property, value) {
      if (currentIndex !== undefined) {
        entities[currentEntity][currentIndex][property] = value;
      } else {
        entities[currentEntity][property] = value;
      }
    },
    clear() {
      entities = cloneDeep(initialState);
      currentEntity = undefined;
      currentIndex = undefined;
    },
  };
}

@Injectable()
export class ImportTextFile {
  constructor(
    private readonly logger: ConsoleLogger,

    private readonly dataSource: DataSource,
  ) {}

  async storeEntities({
    employee,
    department,
    statement,
    donation,
    rate,
  }: any) {
    if (objectIsNotEmpty(employee) && objectIsNotEmpty(department)) {
      employee.id = Number(employee.id);
      employee.departmentId = Number(department.id);
      await this.dataSource
        .createQueryBuilder()
        .insert()
        .into(Department)
        .values(department)
        .orUpdate(['id', 'name'], ['id'])
        .execute();

      await this.dataSource
        .createQueryBuilder()
        .insert()
        .into(Employee)
        .values(employee)
        .orUpdate(
          ['id', 'name', 'surname', 'departmentId'],
          ['id', 'departmentId'],
        )
        .execute();
    }

    if (objectIsNotEmpty(employee) && statement.length > 0) {
      await this.dataSource
        .createQueryBuilder()
        .insert()
        .into(Statement)
        .values(
          statement.map((statement) => {
            statement.employeeId = employee.id;

            return statement;
          }),
        )
        .orUpdate(['id', 'date', 'amount', 'employeeId'], ['id'])
        .execute();
    }

    if (objectIsNotEmpty(employee) && donation.length > 0) {
      await this.dataSource
        .createQueryBuilder()
        .insert()
        .into(Donation)
        .values(
          donation.map(({ id, date, amount: amountWithCurrency }) => {
            const [amount, currency] = amountWithCurrency.split(' ');

            return {
              id,
              date,
              amountInCurrency: Number(amount),
              currency,
              employeeId: employee.id,
              amountUSD: currency === DEFAULT_CURRENCY ? amount : null,
            };
          }),
        )
        .orUpdate(
          [
            'id',
            'date',
            'amountInCurrency',
            'currency',
            'amountUSD',
            'employeeId',
          ],
          ['id'],
        )
        .execute();
    }

    if (rate.length > 0) {
      await this.dataSource
        .createQueryBuilder()
        .insert()
        .into(Rate)
        .values(
          rate.map((rate) => {
            rate.value = +rate.value;
            return rate;
          }),
        )
        .orUpdate(['date', 'sign', 'value'], ['date', 'sign'])
        .execute();
    }
  }

  async updateDonationsWithForeignCurrency() {
    const donationWithUpdatedUSDAmount = await this.dataSource
      .createQueryBuilder()
      .select(['donation'])
      .from(Donation, 'donation')
      .where('donation."amountUSD" is NULL', {})
      .leftJoin(
        Rate,
        'rate',
        '(rate.sign, rate.date) = (donation.currency, donation.date)',
      )
      .addSelect([
        'ROUND(CAST((donation.amountInCurrency * rate.value) AS numeric), 2) as usd',
      ])
      .getRawMany();

    await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(Donation)
      .values(
        donationWithUpdatedUSDAmount.map((donation) => ({
          id: donation.donation_id,
          date: donation.donation_date,
          employeeId: donation.donation_employeeId,
          currency: donation.donation_currency,
          amountInCurrency: donation.donation_amountInCurrency,
          amountUSD: donation.usd,
        })),
      )
      .orUpdate(['amountUSD'], ['id'])
      .execute();
  }

  async run(filePath: string): Promise<void> {
    const regexp =
      /(?<spaces>[\s]+)(?<entity>[A-Z][a-z]*$)?((?<property>[a-z]+):\s(?<value>[\s,a-z,0-9\.]+))?/gi;

    const readRequest = readLineByLine(filePath);
    const dataAggregator = entityParser();
    this.logger.log(`Started importing the file: ${filePath}`);
    for await (const line of readRequest) {
      const parsed = [...line.matchAll(regexp)]?.at(0)?.groups;

      if (parsed === undefined) continue;

      const { entity, property, value } = parsed;

      if (BLACK_LIST_ENTITIES.includes(entity)) continue;

      if (entity) {
        const entityLowerCase = entity.toLowerCase();
        if (
          [ENTITY_NAME.Employee, ENTITY_NAME.Rate].includes(entityLowerCase) &&
          dataAggregator.hasEmployee()
        ) {
          await this.storeEntities(dataAggregator.getData()).catch((error) =>
            this.logger.error('Something went wrong:', error.message),
          );
          dataAggregator.clear();
        }

        dataAggregator.setEntity(entityLowerCase);
      }

      if (property && value) {
        dataAggregator.setProperty(property, value);
      }
    }
    await this.storeEntities(dataAggregator.getData());

    await this.updateDonationsWithForeignCurrency();

    this.logger.log(`File Successfully imported`);
  }
}
