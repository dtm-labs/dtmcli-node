import { Sequelize, Optional, ModelDefined, DataTypes, Model } from 'sequelize';
interface BarrierAttributes {
  id: string;
  transType: string;
  gid: string;
  branchId: string;
  op: string;
  barrierId: string;
  reason: string;
}
type BarrierCreationAttributes = Optional<BarrierAttributes, 'id'>;

export let Barrier: ModelDefined<BarrierAttributes, BarrierCreationAttributes>;

export function initModel(sequelize: Sequelize, tableName = 'barrier'): void {
  Barrier = sequelize.define<Model<BarrierAttributes, BarrierCreationAttributes>>('barrier', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
    },
    transType: {
      type: DataTypes.STRING
    },
    gid: {
      type: DataTypes.STRING
    },
    branchId: {
      type: DataTypes.STRING
    },
    op: {
      type: DataTypes.STRING
    },
    barrierId: {
      type: DataTypes.STRING
    },
    reason: {
      type: DataTypes.STRING
    }

  }, {
    tableName,
    underscored: true,
    createdAt: 'create_time',
    updatedAt: 'update_time',
  });
}

