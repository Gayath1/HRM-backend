const stream = require('stream');
//const await = require('await')
const fs = require('fs');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const jwt = require('jsonwebtoken');

const { Employees,Organization,User } = require('../models');
const { makeRes, to, filterErrors } = require('../utils/helpers');
const status = require('../services/status');

const csv = require('fast-csv');
const Json2csvParser = require('json2csv').Parser;

/**
 * Upload Single CSV file/ and Import data to PostgreSQL database
 * 
 * @param {Object} req.user
 * @param {Object} req.user.id
 * @param {Object} req.params
 * @param {Object} req.params.organizationId
 * @param {*} req    
 * @param {*} res 
 */
exports.uploadFile = async (req, res) => {
    // Find user
    let err, user;
    [err, user] = await to(User.findOne({
      where: {
        id: req.user.id
      }
    }));
  
    if (err) {
      return res.status(500).send(makeRes('Something went wrong.'));
    }
  
    if (!user) {
      return res.status(400).send(makeRes('User not found.'));
    }
  
    // Find organization
    let organizations;
    [err, organizations] = await to(user.getOrganizations({
      where: {
        id: req.params.organizationId
      }
    }));
  
    if (err) {
      return res.status(500).send(makeRes('Something went wrong.'));
    }
  
    if (!organizations || organizations.length <= 0) {
      return res.status(400).send(makeRes('Organization not found.'));
    }
  
    let organization = organizations[0];
    
    try{
        const employees = [];
        fs.createReadStream(__basedir + "/uploads/" + req.file.filename)
            .pipe(csv.parse({ headers: true }))
            .on('error', error => {
                console.error(error);
                throw error.message;
            })
            .on('data', row => {
                employees.push(row);
                console.log(row);
            })
            .on('end', () => {
                // Save Employees to PostgreSQL database
                Employees.bulkCreate(employees).then(() => {
                    const result = {
                        status: "ok",
                        filename: req.file.originalname,
                        message: "Upload Successfully!",
                    }
    
                    res.json(result);
                });    
            });
    }catch(error){
        const result = {
            status: "fail",
            filename: req.file.originalname,
            message: "Upload Error! message = " + error.message
        }
        res.json(result);
    }
}

/** 
 * Upload multiple Excel Files
 *  
 * @param {*} req 
 * @param {*} res 
 */
exports.uploadMultipleFiles = async (req, res) => {
    const messages = [];
    
	for (const file of req.files) {
        try{
            // Parsing CSV Files to data array objects
            const csvParserStream = fs.createReadStream(__basedir + "/uploads/" + file.filename)
                        .pipe(csv.parse({ headers: true }));

            var end = new Promise(function(resolve, reject) {
                let employees = [];

                csvParserStream.on('data', object => {
                    employees.push(object);
                    console.log(object);
                });
                csvParserStream.on('end', () => {
                    resolve(employees);
                });
                csvParserStream.on('error', error => {
                    console.error(error);
                    reject
                }); // or something like that. might need to close `hash`
            });
            
            await (async function() {
                let employees = await end;

                // save employees to MySQL/PostgreSQL database
                await Employees.bulkCreate(employees).then(() => {
                    const result = {
                        status: "ok",
                        filename: file.originalname,
                        message: "Upload Successfully!",
                    }
    
                    messages.push(result);
                }); 
            }());
        }catch(error){
            console.log(error);

            const result = {
                status: "fail",
                filename: file.originalname,				
                message: "Error -> " + error.message
            }
            messages.push(result);
        }
	}

	return res.json(messages);
}

const csvWriter = createCsvWriter({
    path: 'out.csv',
    header: [
      {id: 'Id', title: 'Id'},
      {id: 'firstName', title: 'FirstName'},
      {id: 'LastName', title: 'LastName'},
      {id: 'rfid', title: 'RFID'},
    ]
  });

exports.downloadFile = (req, res) => {
    Employees.findAll({attributes: ['id', 'firstName', 'lastname', 'rfid']}).then(objects => {
        const jsonEmployees = JSON.parse(JSON.stringify(objects));
        const csvFields = ['Id', 'FirstName', 'LastName', 'RFID'];
        const json2csvParser = new Json2csvParser({ csvFields });
        const csvData = json2csvParser.parse(jsonEmployees);
        csvWriter
            .writeRecords(data)
            .then(()=> console.log('The CSV file was written successfully'));

        res.setHeader('Content-disposition', 'attachment; filename=Employees.csv');
        res.set('Content-Type', 'text/csv');
        res.status(200).end(csvData);
    });
}