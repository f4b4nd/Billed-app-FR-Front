/**
 * @jest-environment jsdom
 */

import {screen, waitFor, fireEvent} from "@testing-library/dom" ;
import '@testing-library/jest-dom';

import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";

import router from "../app/Router.js";
import Bills from "../containers/Bills.js";
import { ROUTES } from "../constants/routes.js";
import store from "../__mocks__/store.js";
import userEvent from "@testing-library/user-event";


Object.defineProperty(window, 'localStorage', {
  value: localStorageMock 
})

window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))

const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({pathname})
}


describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {

    test("Then bill icon in vertical layout should be highlighted", async () => {

      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon).toHaveClass('active-icon')
    
    })

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

   
    describe("When i click on eye icon", () => {
      test("A modal should open", async () => {
        
        // simulate handleClickIconEye function
        const bills = new Bills({document, onNavigate, store: null, localStorage: window.localStorage})
        const handleClickIconEye = jest.fn((icon) => bills.handleClickIconEye(icon))
        $.fn.modal = jest.fn(() => $())

        // simulate event calling function when clicked
        await waitFor(() => screen.getAllByTestId('icon-eye'))
        const eyeIcon = screen.getAllByTestId('icon-eye')[0]
        eyeIcon.addEventListener('click', function () { handleClickIconEye(this) })
        fireEvent.click(eyeIcon)

        // test that the function was called
        expect(handleClickIconEye).toHaveBeenCalled()

      })
    })
    

  })
})
