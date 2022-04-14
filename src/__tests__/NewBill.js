/**
 * @jest-environment jsdom
 */

import { createEvent, fireEvent, screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import "@testing-library/jest-dom"
import router from "../app/Router.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { fileMock } from "../__mocks__/file.js"
import newBillFixture from "../fixtures/newBill.js"
import storeMock from '../__mocks__/store.js'

/**
 * Then mail-icon should be highlighted
 * When a file is uploaded in other format than jpeg, jpg, png -> then no bill should be created
 * When user submits form -> then a bill is created
 */

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

window.localStorage.setItem('user', JSON.stringify({type: 'Employee', email: 'a@g.com'}))

const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({pathname})
}

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {

    test("Then mail-icon should be highlighted", async () => {
      const root = document.createElement('div')
      root.setAttribute('id', 'root')
      document.body.append(root) 
      
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const mailIcon = screen.getByTestId('icon-mail')
      expect(mailIcon).toHaveClass('active-icon')
    })

    
    describe("When a file is uploaded in not accepted format (other than jpeg, jpg, png)" , () => {

      test("Then no bill should be created", () => {

        document.body.innerHTML = NewBillUI()
        window.localStorage.setItem('user', JSON.stringify({type: 'Employee', email: 'a@g.com'}))

        const newBill = new NewBill({ document, onNavigate, store: storeMock, localStorage: window.localStorage })
        
        const handleChangeFile = jest.spyOn(newBill, 'handleChangeFile')

        const input = screen.getByTestId('file')
        input.addEventListener('change', handleChangeFile)
        fireEvent.change(input, {
          target: {
              files: [new File(['body'], 'file.txt', { type: 'text/txt' })],
          }
        })
        expect(handleChangeFile).toBeCalled()
        expect(input.files[0].name).toBe('file.txt')
        expect(screen.getByTestId('error-file-format').style.display).toBe('block')

      })

    })
    
    describe("When user submits form correctly" , () => {

      test("Then a bill is created", () => {

        document.body.innerHTML = NewBillUI()
        window.localStorage.setItem('user', JSON.stringify({type: 'Employee', email: 'a@g.com'}))

        const newBill = new NewBill({ document, onNavigate, store: storeMock, localStorage: window.localStorage })

        const updateBill = jest.spyOn(newBill, 'updateBill')

        const form = screen.getByTestId('form-new-bill')
        fireEvent.submit(form)

        expect(updateBill).toHaveBeenCalledTimes(1)

      })

    })

  })
})
