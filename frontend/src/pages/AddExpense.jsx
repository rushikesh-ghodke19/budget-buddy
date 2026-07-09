import { useContext, useEffect, useRef, useState } from "react";
import Input from "../components/Input";
import { Link } from "react-router-dom";
import { validateAddExpense } from "../utils/addExpenseValidation";
import Dropdown from "../components/Dropdown";
import { CiGrid42 } from "react-icons/ci";
import { CiFileOn } from "react-icons/ci";
import { CiDollar } from "react-icons/ci";
import { CiCreditCard1 } from "react-icons/ci";
import useToast from "../hooks/useToast";
import { Data } from "../context/DataProvider";
import useApi from "../hooks/useApi";
import { API_PATHS, BASE_URL } from "../utils/apiPaths";
import Loading from "../components/Loading";

const AddExpense = () => {
  const { user } = useContext(Data);
  const { showWarning, showError, showSuccess } = useToast();
  const userId = localStorage.getItem("userId");

  const date = new Date();
  const currentDate = date.getDate();

  const [selectedYear, setSelectedYear] = useState(date.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(
    date.toLocaleString("en-us", { month: "long" }),
  );
  const [selectedDay, setSelectedDay] = useState(date.getDate());

  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("");

  const [activeDropdown, setActiveDropdown] = useState(null);

  const { callApi, loading } = useApi();

  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const years = Array.from({ length: 5 }, (_, i) => 2026 + i);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const wrapperRef = useRef(null);

  const getDaysInMonth = (month, year) => {
    if (!month || !year) return [];
    const monthIndex = months.indexOf(month);
    const days = new Date(year, monthIndex + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => i + 1);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddExpense = async (e) => {
    e.preventDefault();

    const validateInput = validateAddExpense({
      year: selectedYear,
      month: selectedMonth,
      day: selectedDay,
      category,
      description,
      amount,
      paymentMode,
    });

    if (validateInput) {
      showWarning("Validation Error", validateInput.message);

      if (validateInput.field === "amount") inputRefs[2].current.focus();
      if (validateInput.field === "paymentMode") inputRefs[3].current.focus();
      return;
    }

    //? API Call
    const { data, error } = await callApi(
      "post",
      `${BASE_URL}${API_PATHS.EXPENSE.ADDEXPENSE}`,
      {
        year: selectedYear,
        month: selectedMonth,
        day: selectedDay,
        category,
        description,
        amount,
        paymentMode,
        userId,
      },
    );

    if (error) {
      console.log(error);
      showError("Error", error.message);
      return;
    }

    if (!data) return;

    if (!data.success) {
      return showWarning("Warning", data.message);
    }
    showSuccess("Success", data.message);
  };

  return (
    <>
      <div className="w-full">
        <div className="w-full h-full px-4 sm:px-6 lg:px-8">
          <div className="py-4 border-b border-b-gray-200 flex sm:flex-row flex-col gap-2 justify-between">
            <h1 className="text-3xl text-budget-buddy-950 font-semibold tracking-wide">
              Add New Expense
            </h1>
            <h1 className="flex items-center gap-2 text-2xl text-gray-700 font-semibold tracking-wide">
              Today's Date:
              <span className="font-medium">
                {`${currentDate}${currentDate === 1 ? "st" : currentDate === 2 ? "nd" : currentDate === 3 ? "rd" : "th"} ${date.toLocaleString("en-us", { month: "long" })}, ${date.getFullYear()}`}
              </span>
            </h1>
          </div>
          <form className="w-full flex flex-col gap-8">
            {/* Select Date */}
            <div className="w-full mt-8 flex flex-col gap-4">
              <h1 className="text-2xl text-budget-buddy-950 font-semibold tracking-wide">
                Select Date
              </h1>
              <div
                ref={wrapperRef}
                className="w-full flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8"
              >
                <Dropdown
                  width="w-full"
                  label="Year"
                  data={years}
                  selected={selectedYear}
                  setSelected={setSelectedYear}
                  type="year"
                  activeDropdown={activeDropdown}
                  setActiveDropdown={setActiveDropdown}
                />
                <Dropdown
                  width="w-full"
                  label="Month"
                  data={months}
                  selected={selectedMonth}
                  setSelected={setSelectedMonth}
                  type="month"
                  activeDropdown={activeDropdown}
                  setActiveDropdown={setActiveDropdown}
                />
                <Dropdown
                  width="w-full"
                  label="Day"
                  data={getDaysInMonth(selectedMonth, selectedYear)}
                  selected={selectedDay}
                  setSelected={setSelectedDay}
                  type="day"
                  activeDropdown={activeDropdown}
                  setActiveDropdown={setActiveDropdown}
                  disabled={!selectedYear || !selectedMonth}
                />
              </div>
            </div>

            {/* Enter Category & Description */}
            <div className="w-full flex flex-col gap-4">
              <h1 className="text-2xl font-semibold tracking-wide">
                Enter Category & Description
              </h1>
              <div className="w-full flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8">
                <Input
                  width="sm:w-124 w-full"
                  type="text"
                  placeholder="Category"
                  value={category}
                  name="Category"
                  onChange={(e) => setCategory(e.target.value)}
                  icon={<CiGrid42 />}
                  label="Category"
                  ref={inputRefs[0]}
                />
                <Input
                  width="sm:w-124 w-full"
                  type="text"
                  placeholder="Description"
                  value={description}
                  name="Description"
                  onChange={(e) => setDescription(e.target.value)}
                  icon={<CiFileOn />}
                  label="Description"
                  ref={inputRefs[1]}
                />
              </div>
            </div>

            {/* Enter Amount & Payment Mode */}
            <div className="w-full flex flex-col gap-4">
              <h1 className="text-2xl font-semibold tracking-wide">
                Enter Amount & Payment Mode
              </h1>
              <div className="w-full flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8">
                <Input
                  width="sm:w-124 w-full"
                  type="number"
                  placeholder="Amount"
                  value={amount}
                  name="Amount"
                  onChange={(e) => setAmount(e.target.value)}
                  icon={<CiDollar />}
                  label="Amount"
                  ref={inputRefs[2]}
                />
                <Input
                  width="sm:w-124 w-full"
                  type="text"
                  placeholder="Payment Mode"
                  value={paymentMode}
                  name="Payment Mode"
                  onChange={(e) => setPaymentMode(e.target.value)}
                  icon={<CiCreditCard1 />}
                  label="Payment Mode"
                  ref={inputRefs[3]}
                />
              </div>
            </div>

            {/* Add Expense & View Expenses */}
            <div className="w-full flex items-center gap-4">
              <button
                type="button"
                className="px-8 py-5 bg-budget-buddy-400/20 rounded-2xl text-budget-buddy-600 hover:text-white text-xl tracking-wide hover:bg-budget-buddy-600 transition-all ease-in-out cursor-pointer"
                onClick={handleAddExpense}
              >
                {loading ? (
                  <div className="flex items-center gap-4">
                    <Loading w="w-8" h="h-8" />
                    Adding Expense
                  </div>
                ) : (
                  "Add Expense"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddExpense;
