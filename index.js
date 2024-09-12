const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer').default;

// Function to list all files in a directory
function listFiles(directory) {
    return fs.readdirSync(directory).filter(file => fs.lstatSync(path.join(directory, file)).isFile());
}

// Function to preview renaming changes
function previewRenames(files, searchString, replacementString) {
    return files.map(file => ({
        original: file,
        renamed: file.replace(searchString, replacementString)
    }));
}

// Function to rename files based on a given search and replace string
function renameFiles(directory, searchString, replacementString) {
    const files = listFiles(directory);
    const renames = previewRenames(files, searchString, replacementString);

    renames.forEach(({ original, renamed }) => {
        if (original !== renamed) {
            const oldPath = path.join(directory, original);
            const newPath = path.join(directory, renamed);
            fs.renameSync(oldPath, newPath);
            console.log(`Renamed: ${original} -> ${renamed}`);
        }
    });
}

// CLI Interface using Inquirer
async function main() {
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'directory',
            message: 'Enter the directory path:',
            validate: input => fs.existsSync(input) ? true : 'Directory does not exist.'
        },
        {
            type: 'input',
            name: 'searchString',
            message: 'Enter the string you want to replace in filenames:',
            validate: input => input.length > 0 ? true : 'Please enter a valid string to search for.'
        },
        {
            type: 'input',
            name: 'replacementString',
            message: 'Enter the replacement string:',
            default: ''
        },
        {
            type: 'confirm',
            name: 'preview',
            message: 'Would you like to preview the changes before renaming?',
            default: true
        }
    ]);

    const { directory, searchString, replacementString, preview } = answers;
    const files = listFiles(directory);
    const renames = previewRenames(files, searchString, replacementString);

    if (preview) {
        console.log('\nPreview of Renaming Changes:');
        renames.forEach(({ original, renamed }) => {
            if (original !== renamed) {
                console.log(`Rename: ${original} -> ${renamed}`);
            }
        });

        const confirm = await inquirer.prompt({
            type: 'confirm',
            name: 'proceed',
            message: 'Do you want to proceed with these changes?',
            default: false
        });

        if (!confirm.proceed) {
            console.log('Renaming cancelled.');
            return;
        }
    }

    renameFiles(directory, searchString, replacementString);
    console.log('Renaming completed.');
}

main();