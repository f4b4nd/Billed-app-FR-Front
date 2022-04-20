/**
 * @jest-environment jsdom
 */

import {screen, waitFor, fireEvent} from "@testing-library/dom" ;
import '@testing-library/jest-dom';

import BillsUI from "../views/BillsUI.js"
import { bills as billsFixtures } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";

import router from "../app/Router.js";
import Bills from "../containers/Bills.js";
import { ROUTES } from "../constants/routes.js";
import storeMock from "../__mocks__/store.js";
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
      document.body.innerHTML = BillsUI({ data: billsFixtures })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })


    test("Then bills are fetched from store", async () => {

      const bills = new Bills({document, onNavigate: window.onNavigate, store: storeMock, localStorage: window.localStorage})
      const getBills = jest.spyOn(bills, "getBills")
      const billsFetched = await bills.getBills()

      expect(billsFetched.length).toEqual(4)
      expect(getBills).toHaveBeenCalled()

    })

    describe("When i click on eye icon", () => {
      test("Then a modal should open", async () => {
        
        // simulate handleClickIconEye function
        const bills = new Bills({document, onNavigate, store: storeMock, localStorage: window.localStorage})
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
    
    describe("When i click on new bill button", () => {

      test("Then i should be redirected on new Bill page", async () => {
        
        document.body.innerHTML = BillsUI({data : billsFixtures})
        await waitFor(() => screen.getByTestId('btn-new-bill'))
        const newBillButton = screen.getByTestId('btn-new-bill')
        
        const bills = new Bills({document, onNavigate, store: null, localStorage: window.localStorage})
        const handleClickNewBill = jest.spyOn(bills, 'handleClickNewBill')
        newBillButton.addEventListener('click', handleClickNewBill)
        userEvent.click(newBillButton)

        await waitFor(() => screen.getByText("Envoyer une note de frais"))
        const newBillPageTitle = screen.getByText("Envoyer une note de frais")
        expect(handleClickNewBill).toHaveBeenCalled()
        expect(newBillPageTitle).toBeTruthy()

      })
    })

    describe('When back-end sends an error message', () => {
      test('Then an error message should be rendered', () => {
        document.body.innerHTML = BillsUI({ error: 'This is an error message' })
        expect(screen.getAllByText('This is an error message')).toBeTruthy()
      })
    })

    describe('When the page is still loading', () => {
      test('Then loading message should be displayed', () => {
        document.body.innerHTML = BillsUI({ loading: true })
        expect(screen.getAllByText('Loading...')).toBeTruthy()
      })
    })

  })

})
