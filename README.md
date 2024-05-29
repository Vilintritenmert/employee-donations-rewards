# Employee Donations and Rewards
This repository contains a application that imports employee data from a dump file into a database and an API endpoint that calculates rewards for employees based on their charitable donations.

## Requirements
- Node.js
- Nest.js
- TypeOrm 
- PostgreSQL 
- Docker-Compose 

## Installation
 ```bash
 1. git clone https://github.com/vilintritenmert/employee-donations-rewards.git
 2. cd employee-donations-rewards
 3. npm i
 4. cp .env.example .env
 5. docker-compose up 
  ```

### Feature: Import Data through CLI 
```bash
1) docker-compose run --rm data_aggregator_web /bin/bash  
2) node ./dist/command import /home/node/app/data/dump.txt
3) Enjoy :)
```

### Feature: API Endpoint

### Call API end point
```
http://localhost:3000/
```

