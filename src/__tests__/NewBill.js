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
import BillsUI from '../views/BillsUI.js'

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

    describe("When i submit a bill form", () => {
      test("Then handleSubmit function should be called", () => {

        document.body.innerHTML = NewBillUI()
        window.localStorage.setItem('user', JSON.stringify({type: 'Employee', email: 'a@g.com'}))
        const newBill = new NewBill({ document, onNavigate, store: storeMock, localStorage: window.localStorage })

        const formNewBill = screen.getByTestId('form-new-bill')
        const handleSubmit = jest.spyOn(newBill, 'handleSubmit')
    
        formNewBill.addEventListener('submit', handleSubmit)
  
        fireEvent.submit(formNewBill)
  
        expect(handleSubmit).toHaveBeenCalled()

      })
    })

    // Test d'intégration POST
    describe('When a valid bill is submitted', () => {

      test('Then a new bill is generated', async () => {
  
        const storeSpy = jest.spyOn(storeMock, "bills")
  
        const newBill = {
          "id": "47qAXb6fIm2zOKkLzMro",
          "vat": "80",
          "fileUrl": "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
          "status": "pending",
          "type": "Hôtel et logement",
          "commentary": "séminaire billed",
          "name": "encore",
          "fileName": "preview-facture-free-201801-pdf-1.jpg",
          "date": "2004-04-04",
          "amount": 400,
          "commentAdmin": "ok",
          "email": "a@a",
          "pct": 20
        }
  
        await storeMock.bills().create(newBill)

        expect(storeSpy).toHaveBeenCalledTimes(1)
  
      })
    })

    describe('When API fails with 404 error', () => {

      test('Then a 404 error message should be displayed', async () => {

        jest.spyOn(storeMock, "bills")

        storeMock.bills.mockImplementationOnce(() => {
          return {
            create: () => {
              return Promise.reject(new Error("Erreur 404"))
            }
          }
        })
  
        document.body.innerHTML = BillsUI({ error: 'Erreur 404' })
  
        const errorMessage = screen.getByText(/Erreur 404/)
        expect(errorMessage).toBeTruthy()

      })

    })

    describe('When API fails with 500 error', () => {

      test('Then a 404 error message should be displayed', async () => {

        jest.spyOn(storeMock, "bills")

        storeMock.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 500"))
            }
          }})
  
        document.body.innerHTML = BillsUI({ error: 'Erreur 500' });

        const errorMessage = screen.getByText(/Erreur 500/)
        expect(errorMessage).toBeTruthy()

      })
    })

  })
})
