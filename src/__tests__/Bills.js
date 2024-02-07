/**
 * @jest-environment jsdom
 */
import mockStore from "../__mocks__/store.js";
import { screen, waitFor, within } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";



import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      dates.sort(antiChrono);
      expect(dates).toEqual(datesSorted)
    })
  })

  describe("When I navigate to Bills Page", () => {
    test("fetches bills from mock API GET", async () => {
      jest.spyOn(mockStore, "bills");
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );

      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);

      await waitFor(() => screen.getByText("Mes notes de frais"));

      const newBillBtn = await screen.findByRole("button", {
        name: /nouvelle note de frais/i,
      });
      const billsTableRows = screen.getByTestId("tbody");

      expect(newBillBtn).toBeTruthy();
      expect(billsTableRows).toBeTruthy();
      expect(within(billsTableRows).getAllByRole("row")).toHaveLength(4);
    });

    test("fetches bills from an API and fails with 404 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 404"));
          },
        };
      });
    
      try {

        window.onNavigate(ROUTES_PATH.Bills);
  
        await new Promise(process.nextTick);
      } catch (error) {

        expect(error.message).toBe("Erreur 404");
      }
    });
    

    test("fetches bills from an API and fails with 500 message error", async () => {
      
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 500"));
          },
        };
      });
    
      try {
    
        window.onNavigate(ROUTES_PATH.Bills);
    
        await new Promise(process.nextTick);
      } catch (error) {

        expect(error.message).toBe("Erreur 500");
      }
    });
    
  });
})
