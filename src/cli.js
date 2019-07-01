import arg from 'arg';
import inquirer from 'inquirer';
import fs from 'fs';
import { downloadDocs } from './main'

function parseArgumentsIntoOptions(rawArgs) {
    const args = arg({
        '--save': String,
        '-s': '--save',
        '--fileName': String,
        '-f': '--fileName',
        '--code': String,
        '-c': '--code',
        '--subProduct': String,
        '-u': '--subProduct'
    }, 
    {
        argv: rawArgs.slice(2)
    });

    return {
        product: args._[0],
        subProduct: args['--subProduct'] || '',
        pathToSave: args['--save'] ,
        fileName: args['--fileName'],
        code: args['--code'] || 'C#'
    }
}

async function promptForMissingOptions(options){
    const questions = [];
    if(!options.product){
        questions.push({
            name: 'product',
            message: 'Enter name of GCP product',
            validate: (input) => {
                if(!input){
                    return 'You need to provide name of GCP product';
                }

                if(!options.fileName){
                    options.fileName = `${input}.pdf`
                }
                return true;
            }
        });
    }

    if(!options.subProduct){
        questions.push({
            name: 'subProduct',
            message: 'Enter name of sub-product(optional)',
            default: ''
        })
    }

    if(!options.pathToSave){
        questions.push({
            name: 'pathToSave',
            message: 'Enter path to save pdf file',
            default: './pdf/',
            validate: (input) => {
                if(!fs.existsSync(input)){
                    return `Dir ${input} doesn't exist`
                }

                return true;
            }
        })
    }

    const answers = await inquirer.prompt(questions);
    let product = options.product || answers.product;
    return{
        ...options,
        product: product,
        subProduct: options.subProduct || answers.subProduct,
        fileName: options.fileName || `${product}.pdf`,
        pathToSave: options.pathToSave || answers.pathToSave
    }
}

export async function cli(args) {
    let options = parseArgumentsIntoOptions(args);
    options = await promptForMissingOptions(options);
    await downloadDocs(options);
}