/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import "@testing-library/jest-dom"
import router from "../app/Router.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js"

/**
 * Then mail-icon should be highlighted
 * When a file is uploaded in other format than jpeg, jpg, png -> then no bill should be created
 * When user submits form -> then a bill is created
 */

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))


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

    /*
    describe("When a file is uploaded" , () => {

      test("Then it should not have an accepted format", () => {

      })

    })

    describe("When user submits form" , () => {

      test("Then it should not have an accepted format", () => {

      })

    })*/

  })
})
