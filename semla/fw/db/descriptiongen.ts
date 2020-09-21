import get from '../config/config'
import { getLoadedUserModelList, getUserModels, ModelType } from './models'
import { readFile, writeFile } from 'fs/promises'
import detectNewline from 'detect-newline'
import { Field } from './querying/fields'

const PRELUDE =
    "This comment was generated by semla. Please don't change it\n" +
    '  * manually as your changes may be overwritten'
const TAG = 'generated by semla.'

// find the start of the current line. so search backwards to '\n'
function startOfLine(fullText: string, location: number) {
    const newLine = detectNewline(fullText)
    for (let i = location; i > 0; i--) {
        if (fullText.substr(i, newLine?.length) === newLine) {
            return i
        }
    }
    return 0
}

export function findStartEnd(
    definingFile: string,
    model: ModelType
): { start: number; end: number } {
    let start = 0,
        end = 0
    const tagLocation = definingFile.indexOf(TAG)
    if (tagLocation !== -1) {
        // if we have a tag, then find the location of the start of the tag line
        start = startOfLine(definingFile, tagLocation) // jump to before /*
        end = definingFile.indexOf('*/', start) + 2 + 1
    } else {
        // if we don't have a tag, find the location of the line preceding the
        // class definition
        let classDefinitionLocation = definingFile.indexOf(
            'class ' + model._modelName
        )
        start =
            startOfLine(definingFile, classDefinitionLocation) -
            detectNewline.graceful(definingFile).length +
            1
        end = start
    }
    return {
        start,
        end,
    }
}

function padRight(text: string, width: number) {
    let count = width - text.length
    return text + ' '.repeat(count)
}

export function lineForField(field: Field): [string, string, string, string] {
    let description = ''

    const relationField = field.relationField
    if (relationField) {
        description = 'Relation to ' + relationField.targetModel!._modelName
    }
    return [field.jsName, field.dbName, field.type, description]
}

export async function generateComment(model: ModelType, newlineChar: string) {
    const columnTitles = ['JS Name', 'DB Name', 'DB Type', '']
    const columnValues: [string, string, string, string][] = []

    for (const field of model._fields.getAll()) {
        columnValues.push(lineForField(field))
    }

    const longestContentForIdx = idx => {
        return Math.max(...columnValues.map(x => x[idx].length))
    }
    const columnWidths = columnTitles.map((title, idx) =>
        Math.max(title.length, longestContentForIdx(idx))
    )

    let cmt = newlineChar + `/** ${PRELUDE}` + newlineChar + '  *' + newlineChar
    const titlesLine = (
        `${padRight(columnTitles[0], columnWidths[0])} ` +
        `: ${padRight(columnTitles[1], columnWidths[1])} ` +
        `: ${padRight(columnTitles[2], columnWidths[2])} ` +
        `: ${padRight(columnTitles[3], columnWidths[3])}`
    ).trim()
    cmt += `  * ${titlesLine}` + newlineChar
    cmt += `  * ${'-'.repeat(titlesLine.length)}` + newlineChar
    for (const field of columnValues) {
        cmt +=
            '  ' + (`* ${padRight(field[0], columnWidths[0])} : ` +
            `${padRight(field[1], columnWidths[1])} : ` +
            `${padRight(field[2], columnWidths[2])} : ` +
            `${padRight(field[3], columnWidths[3])}`).trim() +
            newlineChar
    }
    cmt += `  */` + newlineChar
    return cmt
}

export function insertComment(
    original: string,
    start: number,
    end: number,
    content: string
) {
    const chopLength = end - start
    const result =
        original.substr(0, start) +
        content +
        original.substr(start + chopLength)
    return result
}

export async function generateNewContent(
    contentBefore: string,
    model: ModelType
) {
    // does the file have our comment tag? if so start at the start of that,
    // and end at the end of that
    // otherwise just put start and end by the class definition

    const newlineChar = detectNewline.graceful(contentBefore)

    const { start, end } = await findStartEnd(contentBefore, model)
    const content = await generateComment(model, newlineChar)
    const inserted = await insertComment(contentBefore, start, end, content)
    return inserted
}

async function descriptionGen(model: ModelType) {
    const definingFile = await readFile(model._registeringPath, 'utf-8')

    const inserted = await generateNewContent(definingFile, model)
    const isSame = definingFile === inserted
    if (!isSame) {
        // write new contents
        console.log(
            `Writing new comment for model in ${model._registeringPath}!`
        )
        await writeFile(model._registeringPath, inserted, 'utf-8')
    }

    return true
}

export const generateDescriptions = async () => {
    const generateDescriptions = get('models.generate_description')

    if (generateDescriptions) {
        const proms: Promise<boolean>[] = []
        const models = getLoadedUserModelList()
        for (const model of models) {
            proms.push(descriptionGen(model))
        }
        await Promise.all(proms)
    }
}
