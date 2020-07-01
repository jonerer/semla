import { DevFixerupperController } from '../../fw/devtools/controllers/DevFixerupperController'
import { setAppBasedir } from '../../fw/appinfo'
import { join } from 'path'

test('Cssfile resolution', () => {
    const inst = new DevFixerupperController()

    const hr = 'http://localhost:8080/styles.css'

    setAppBasedir('/app/base/dir')
    const resolved = inst._cssFileForHref(hr)
    expect(resolved).toBe(join('/app/base/dir/app/static', '/styles.css'))
})

test('Content patching', () => {
    const contentBefore = `
body {
  color: black;
  background: white;
}

.div > a.shiny {
    /* random comment (which will sadly be removed) */
    font-weight: 400;
    }

.unimportant {
    text-decoration: none;
}
`

    const changes = [
        {
            selector: 'body',
            css: 'body { color: blue; background: green }',
        },
        {
            selector: '.div > a.shiny',
            css: `.div > a.shiny {
    font-weight: 600;
    color: pink !important;
}`,
        },
    ]

    const expected = `
body { color: blue; background: green }

.div > a.shiny {
    font-weight: 600;
    color: pink !important;
}

.unimportant {
    text-decoration: none;
}
`

    const inst = new DevFixerupperController()
    const patched = inst.patchedContents(contentBefore, changes)
    expect(patched).toBe(expected)
})
