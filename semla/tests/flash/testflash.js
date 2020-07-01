import { Flasher } from '../../fw/web/flasher'

test('Should be able to add flashes, and they should flush after flashing', () => {
    const mockEmptySession = {}
    const f = new Flasher(mockEmptySession)
    f.flash('info', 'new info thing')
    f.flash('warn', 'new warning thing')
    f.flash('another info thing')

    const flashesOne = f.flashes()
    const flashesTwo = f.flashes()

    expect(flashesOne.length).toBe(3)
    expect(flashesOne[0].type).toBe('info')
    expect(flashesOne[0].text).toBe('new info thing')
    expect(flashesOne[1].type).toBe('warn')
    expect(flashesOne[1].text).toBe('new warning thing')
    expect(flashesOne[2].type).toBe('info')
    expect(flashesOne[2].text).toBe('another info thing')

    expect(flashesTwo.length).toBe(0)
})
