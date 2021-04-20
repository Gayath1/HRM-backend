const { Shift } = require('../models');
const { makeRes, to } = require('../utils/helpers');

/**
 * List all the available shift types.
 * @param {Object} req.user.id
 * @param {Object|undefined} req 
 * @param {Object} res 
 */
const list = async (req, res) => {
  let err, shiftTypes;
  [err, shiftTypes] = await to(Shift.findAll({
    attributes: ['id', 'shiftName', 'ot_startTime','start_time', 'end_time', 'createdAt','updatedAt'],
    include: [
      {
        model: Organization,
        as: 'organization',
        attributes: ['name'],
        required: true,
        include: [
          {
            model: User,
            as: 'users',
            attributes: [],
            where: {
              id: req.user.id
            }
          }
        ]
      }
    ]
  }));

  if (err) {
    return res.status(500).send(makeRes('Something went wrong.'));
  }

  return res.status(200).send(makeRes('Shift info retrieved.', { shiftTypes }));
}

module.exports = {
  list
};