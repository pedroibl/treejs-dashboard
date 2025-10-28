# Personal Finance Dashboard

A modern, full-stack personal finance management application built with React, TypeScript, Express, and PostgreSQL. Track your income, expenses, budgets, and gain insights into your spending patterns with beautiful visualizations.

![Dashboard Preview](https://via.placeholder.com/800x400?text=Personal+Finance+Dashboard)

## Features

### Core Functionality

**Transaction Management**: Create, edit, and delete income and expense transactions with detailed categorization. Filter transactions by type, category, and date range to quickly find what you need.

**Budget Tracking**: Set monthly budgets for each expense category and monitor your spending in real-time. Visual progress bars show how much of your budget has been used, with clear warnings when you're approaching or exceeding limits.

**Category Organization**: Create custom categories for both income and expenses with color coding and emoji icons. Organize your financial life exactly the way you want it.

**Analytics & Insights**: Visualize your financial data with interactive charts including pie charts for expense breakdown, income distribution, and bar charts comparing income vs expenses by category.

**Responsive Design**: Fully responsive interface that works seamlessly on desktop, tablet, and mobile devices. Access your financial data anywhere, anytime.

### Technical Features

- **Type-Safe API**: Built with tRPC for end-to-end type safety between frontend and backend
- **Real-Time Updates**: Optimistic UI updates for instant feedback
- **Secure Authentication**: OAuth-based authentication with session management
- **Database Migrations**: Automated schema migrations with Drizzle ORM
- **Modern UI Components**: Built with shadcn/ui and Tailwind CSS

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 19 + TypeScript | Modern UI framework with type safety |
| Styling | Tailwind CSS 4 + shadcn/ui | Utility-first CSS with beautiful components |
| Backend | Express 4 + tRPC 11 | Type-safe API layer |
| Database | MySQL/TiDB | Relational database for financial data |
| ORM | Drizzle ORM | Type-safe database queries |
| Charts | Recharts | Data visualization library |
| Date Handling | date-fns | Modern date utility library |

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **pnpm** (v8 or higher) - Install with `npm install -g pnpm`
- **MySQL** or **PostgreSQL** database server
- **Git** for version control

## Database Setup

### Option 1: Local PostgreSQL Installation

#### macOS

Install PostgreSQL using Homebrew:

```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Create a database for the application
createdb finance_dashboard

# Create a user (optional)
createuser -P finance_user
# Enter password when prompted
```

#### Ubuntu/Debian Linux

```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Switch to postgres user and create database
sudo -u postgres psql

# Inside psql prompt:
CREATE DATABASE finance_dashboard;
CREATE USER finance_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE finance_dashboard TO finance_user;
\q
```

#### Windows

1. Download PostgreSQL installer from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run the installer and follow the setup wizard
3. Remember the password you set for the postgres user
4. Open pgAdmin 4 (installed with PostgreSQL)
5. Create a new database named `finance_dashboard`

### Option 2: Local MySQL Installation

#### macOS

```bash
# Install MySQL
brew install mysql

# Start MySQL service
brew services start mysql

# Secure installation
mysql_secure_installation

# Create database
mysql -u root -p
# Enter password, then:
CREATE DATABASE finance_dashboard;
CREATE USER 'finance_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON finance_dashboard.* TO 'finance_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Ubuntu/Debian Linux

```bash
# Install MySQL
sudo apt update
sudo apt install mysql-server

# Start MySQL service
sudo systemctl start mysql
sudo systemctl enable mysql

# Secure installation
sudo mysql_secure_installation

# Create database
sudo mysql
# Then:
CREATE DATABASE finance_dashboard;
CREATE USER 'finance_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON finance_dashboard.* TO 'finance_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Windows

1. Download MySQL installer from [mysql.com](https://dev.mysql.com/downloads/installer/)
2. Run the installer and choose "Developer Default"
3. Follow the setup wizard and set a root password
4. Open MySQL Workbench
5. Create a new database named `finance_dashboard`

### Option 3: Docker (Recommended for Development)

The easiest way to get started is using Docker:

#### PostgreSQL with Docker

```bash
# Pull and run PostgreSQL container
docker run --name finance-postgres \
  -e POSTGRES_DB=finance_dashboard \
  -e POSTGRES_USER=finance_user \
  -e POSTGRES_PASSWORD=your_secure_password \
  -p 5432:5432 \
  -d postgres:15

# Verify it's running
docker ps
```

#### MySQL with Docker

```bash
# Pull and run MySQL container
docker run --name finance-mysql \
  -e MYSQL_DATABASE=finance_dashboard \
  -e MYSQL_USER=finance_user \
  -e MYSQL_PASSWORD=your_secure_password \
  -e MYSQL_ROOT_PASSWORD=root_password \
  -p 3306:3306 \
  -d mysql:8

# Verify it's running
docker ps
```

### Database Connection String

Once your database is set up, you'll need to create a connection string. The format varies by database:

**PostgreSQL:**
```
postgresql://finance_user:your_secure_password@localhost:5432/finance_dashboard
```

**MySQL:**
```
mysql://finance_user:your_secure_password@localhost:3306/finance_dashboard
```

**For Docker containers**, use the same connection strings as above since we mapped the ports to localhost.

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/pedroibl/treejs-dashboard.git
cd treejs-dashboard
```

### 2. Install Dependencies

```bash
pnpm install
```

This will install all required dependencies for both frontend and backend.

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
touch .env
```

Edit the `.env` file and add your database connection string:

```env
# Database Connection (REQUIRED)
DATABASE_URL=mysql://finance_user:your_secure_password@localhost:3306/finance_dashboard
```

Replace the connection string with your actual database credentials from the previous step.

**Note**: If you're running this project on the Manus platform, all other environment variables (JWT_SECRET, OAuth configuration, etc.) are automatically provided. For local development outside of Manus, you may need to configure additional environment variables for authentication.

**Important**: Never commit the `.env` file to version control. It's already included in `.gitignore`.

### 4. Database Migration

Run the database migrations to create all necessary tables:

```bash
pnpm db:push
```

This command will:
- Generate migration files based on your schema
- Apply migrations to your database
- Create tables: `users`, `categories`, `transactions`, `budgets`

You should see output like:
```
✓ Your SQL migration file ➜ drizzle/0001_*.sql 🚀
✓ migrations applied successfully!
```

### 5. Start the Development Server

```bash
pnpm dev
```

The application will start on `http://localhost:3000`

You should see:
```
Server running on http://localhost:3000/
```

### 6. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

You'll be prompted to sign in. After authentication, you can start using the dashboard.

## Project Structure

```
treejs-dashboard/
├── client/                  # Frontend React application
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── ui/        # shadcn/ui components
│   │   │   └── DashboardLayout.tsx
│   │   ├── pages/         # Page components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Transactions.tsx
│   │   │   ├── Budgets.tsx
│   │   │   ├── Analytics.tsx
│   │   │   └── Categories.tsx
│   │   ├── lib/           # Utilities and configurations
│   │   │   └── trpc.ts    # tRPC client setup
│   │   └── App.tsx        # Main app component with routing
│   └── index.html
├── server/                 # Backend Express application
│   ├── _core/             # Core server infrastructure
│   ├── db.ts              # Database query helpers
│   └── routers.ts         # tRPC API routes
├── drizzle/               # Database schema and migrations
│   └── schema.ts          # Database table definitions
├── shared/                # Shared types and constants
├── package.json
└── drizzle.config.ts      # Drizzle ORM configuration
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with hot reload |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm db:push` | Generate and apply database migrations |
| `pnpm db:studio` | Open Drizzle Studio (database GUI) |
| `pnpm lint` | Run ESLint |
| `pnpm type-check` | Run TypeScript type checking |

## Database Schema

### Users Table

Stores user authentication and profile information.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key, auto-increment |
| openId | VARCHAR(64) | OAuth identifier, unique |
| name | TEXT | User's display name |
| email | VARCHAR(320) | User's email address |
| role | ENUM | User role: 'user' or 'admin' |
| createdAt | TIMESTAMP | Account creation date |
| lastSignedIn | TIMESTAMP | Last login timestamp |

### Categories Table

Organizes transactions into income and expense categories.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key, auto-increment |
| userId | INT | Foreign key to users table |
| name | VARCHAR(100) | Category name |
| type | ENUM | 'income' or 'expense' |
| color | VARCHAR(7) | Hex color code for UI |
| icon | VARCHAR(50) | Optional emoji icon |
| createdAt | TIMESTAMP | Creation date |

### Transactions Table

Records all financial transactions.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key, auto-increment |
| userId | INT | Foreign key to users table |
| categoryId | INT | Foreign key to categories table |
| amount | INT | Amount in cents (to avoid decimal issues) |
| description | TEXT | Optional transaction description |
| type | ENUM | 'income' or 'expense' |
| date | TIMESTAMP | Transaction date |
| createdAt | TIMESTAMP | Record creation date |
| updatedAt | TIMESTAMP | Last update date |

### Budgets Table

Stores monthly budget limits per category.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key, auto-increment |
| userId | INT | Foreign key to users table |
| categoryId | INT | Foreign key to categories table |
| amount | INT | Budget amount in cents |
| month | VARCHAR(7) | Month in YYYY-MM format |
| createdAt | TIMESTAMP | Record creation date |
| updatedAt | TIMESTAMP | Last update date |

## API Documentation

The application uses tRPC for type-safe API communication. All API routes are automatically typed and available through the `trpc` client.

### Categories API

```typescript
// List all categories for the current user
trpc.categories.list.useQuery()

// Create a new category
trpc.categories.create.useMutation({
  name: "Groceries",
  type: "expense",
  color: "#ef4444",
  icon: "🛒"
})

// Update a category
trpc.categories.update.useMutation({
  id: 1,
  name: "Food & Groceries",
  color: "#f97316"
})

// Delete a category
trpc.categories.delete.useMutation({ id: 1 })
```

### Transactions API

```typescript
// List transactions with optional filters
trpc.transactions.list.useQuery({
  startDate: "2025-01-01",
  endDate: "2025-01-31",
  categoryId: 1,
  type: "expense"
})

// Create a transaction
trpc.transactions.create.useMutation({
  categoryId: 1,
  amount: 5000, // $50.00 in cents
  description: "Weekly groceries",
  type: "expense",
  date: "2025-01-15"
})

// Update a transaction
trpc.transactions.update.useMutation({
  id: 1,
  amount: 5500,
  description: "Updated description"
})

// Delete a transaction
trpc.transactions.delete.useMutation({ id: 1 })
```

### Budgets API

```typescript
// List budgets for a specific month
trpc.budgets.list.useQuery({ month: "2025-01" })

// Create a budget
trpc.budgets.create.useMutation({
  categoryId: 1,
  amount: 50000, // $500.00 in cents
  month: "2025-01"
})

// Update a budget
trpc.budgets.update.useMutation({
  id: 1,
  amount: 60000
})

// Delete a budget
trpc.budgets.delete.useMutation({ id: 1 })
```

### Dashboard API

```typescript
// Get dashboard statistics
trpc.dashboard.stats.useQuery({
  startDate: "2025-01-01",
  endDate: "2025-01-31"
})
// Returns: { totalIncome, totalExpenses, balance, transactionCount }

// Get category spending breakdown
trpc.dashboard.categorySpending.useQuery({
  startDate: "2025-01-01",
  endDate: "2025-01-31"
})
// Returns: Array of { categoryId, categoryName, categoryColor, total, type }
```

## Usage Guide

### Getting Started

1. **Create Categories**: Start by creating income and expense categories that match your financial life (e.g., Salary, Groceries, Rent, Entertainment)

2. **Add Transactions**: Record your income and expenses as they occur, assigning them to the appropriate categories

3. **Set Budgets**: Create monthly budgets for your expense categories to track spending limits

4. **Monitor Analytics**: Use the Analytics page to visualize your spending patterns and identify areas for improvement

### Best Practices

**Record Transactions Regularly**: Make it a habit to log transactions daily or weekly to maintain accurate records and avoid forgetting expenses.

**Use Descriptive Categories**: Create specific categories that make sense for your spending patterns. Instead of a generic "Shopping" category, consider separate categories like "Groceries," "Clothing," and "Electronics."

**Review Monthly**: At the end of each month, review your analytics to understand where your money went and adjust your budgets accordingly.

**Set Realistic Budgets**: Start with budgets based on your actual spending patterns, then gradually adjust them to meet your financial goals.

## Troubleshooting

### Database Connection Issues

**Problem**: `Error: connect ECONNREFUSED`

**Solution**: Ensure your database server is running:
```bash
# For PostgreSQL
brew services list  # macOS
sudo systemctl status postgresql  # Linux

# For MySQL
brew services list  # macOS
sudo systemctl status mysql  # Linux

# For Docker
docker ps
```

**Problem**: `Authentication failed for user`

**Solution**: Verify your database credentials in the `.env` file match your database setup. Try connecting manually:
```bash
# PostgreSQL
psql -U finance_user -d finance_dashboard -h localhost

# MySQL
mysql -u finance_user -p finance_dashboard
```

### Migration Issues

**Problem**: `Migration failed` or `Table already exists`

**Solution**: Reset your database and rerun migrations:
```bash
# Drop all tables (WARNING: This deletes all data)
pnpm db:drop

# Rerun migrations
pnpm db:push
```

### Port Already in Use

**Problem**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solution**: Another process is using port 3000. Find and kill it:
```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

Or change the port in your configuration.

### TypeScript Errors

**Problem**: Type errors after pulling new changes

**Solution**: Reinstall dependencies and restart the dev server:
```bash
rm -rf node_modules
pnpm install
pnpm dev
```

## Production Deployment

### Environment Variables

Ensure all production environment variables are set:

```env
DATABASE_URL=your_production_database_url
JWT_SECRET=strong_random_secret_for_production
NODE_ENV=production
```

### Build the Application

```bash
pnpm build
```

### Start Production Server

```bash
pnpm start
```

### Deployment Platforms

This application can be deployed to various platforms:

- **Vercel**: Automatic deployments from Git
- **Railway**: Easy database and app hosting
- **Heroku**: Classic PaaS platform
- **DigitalOcean**: App Platform or Droplets
- **AWS**: EC2, RDS, and Elastic Beanstalk

Refer to your chosen platform's documentation for specific deployment instructions.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Search existing [GitHub Issues](https://github.com/pedroibl/treejs-dashboard/issues)
3. Create a new issue with detailed information about your problem

## Acknowledgments

- Built with [tRPC](https://trpc.io/) for type-safe APIs
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Charts powered by [Recharts](https://recharts.org/)
- Database ORM by [Drizzle](https://orm.drizzle.team/)

---

**Made with ❤️ by the treejs-dashboard team**
