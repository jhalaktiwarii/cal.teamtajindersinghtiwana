export interface TableConfig {
  tableName: string;
  indexes?: {
    [key: string]: {
      name: string;
      hashKey: string;
      rangeKey?: string;
    };
  };
}

export interface TablesConfig {
  [key: string]: TableConfig;
}

export const TABLES: TablesConfig = {
  USERS: {
    tableName: "TST_Users",
  },
  APPOINTMENTS: {
    tableName: "TST_Appointments",
    indexes: {
      byUser: {
        name: "PatientAppointments",
        hashKey: "userid",
        rangeKey: "startTime"
      }
    }
  },
  BIRTHDAYS: {
    tableName: "TST_Birthdays",
    indexes: {
      byUser: {
        name: "UserBirthdays",
        hashKey: "userid",
        rangeKey: "date"
      }
    }
  }
};

export const getTableName = (key: keyof typeof TABLES) => TABLES[key].tableName;
export const getTableConfig = (key: keyof typeof TABLES) => TABLES[key];