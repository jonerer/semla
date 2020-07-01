import * as livereload from 'livereload'
import get from '../../config/config'
import path from 'path'
import { getAppBasedir } from '../../appinfo'

export const injectLiveReload = renderedHtml => {
    return (
        renderedHtml +
        `
<script>
  document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] +
  ':35729/livereload.js?snipver=1"></' + 'script>')
</script> 

    `
    )
}

let lrserver

export const initLiveReload = () => {
    if (get('livereload.enabled')) {
        lrserver = livereload.createServer()
        const staticDir = path.join(getAppBasedir(), '/app/static')
        lrserver.watch(staticDir)
    }
}

export const reload = () => {
    if (get('livereload.enabled')) {
        lrserver.refresh('whatever')
    }
}
