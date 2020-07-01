export class BaseController {
    checkAuth() {
        console.log('checkar auth. res:', this.req.path)
    }
}
