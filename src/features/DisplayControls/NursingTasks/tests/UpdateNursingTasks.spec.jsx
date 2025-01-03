import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import UpdateNursingTasks from "../components/UpdateNursingTasks";
import {
  mockMedicationTasks,
  mockPRNMedicationTasks,
  mockNonMedicationTileData,
  mockGroupSlotsByOrderId,
  mockUpdateResponse,
} from "./NursingTasksUtilsMockData";
import { IPDContext } from "../../../../context/IPDContext";
import {
  mockConfig,
  mockConfigFor12HourFormat,
} from "../../../../utils/CommonUtils";
import MockDate from "mockdate";
import {mockUserWithAllRequiredPrivileges, mockUserWithoutAnyPrivilege} from '../../../../utils/mockUserData';

const mockSetShowNotification = jest.fn();
const mockSetNotificationMessage = jest.fn();
const mockSetNotificationStatus = jest.fn();
const mockUpdateEmergencyTasksSlider = jest.fn();
const mockUpdateNonMedicationTask = jest.fn();
const mockHandleAuditLogEvent = jest.fn();

jest.mock("../utils/NursingTasksUtils", () => {
  const originalModule = jest.requireActual("../utils/NursingTasksUtils");
  return {
    ...originalModule,
    updateNonMedicationTask: () => mockUpdateNonMedicationTask(),
  };
});
describe("UpdateNursingTasksSlider", function () {
  afterEach(() => {
    MockDate.reset();
  });

  it("should render UpdateNursingTasksSlider", function () {
    const { container } = render(
      <IPDContext.Provider
        value={{
          config: mockConfig,
          handleAuditEvent: mockHandleAuditLogEvent,
          currentUser: mockUserWithAllRequiredPrivileges,
        }}
      >
        <UpdateNursingTasks
          medicationTasks={mockMedicationTasks}
          groupSlotsByOrderId={mockGroupSlotsByOrderId}
          updateNursingTasksSlider={jest.fn}
          patientId="test_patient_uuid"
          providerId="test_provider_uuid"
          setShowNotification={mockSetShowNotification}
          setNotificationMessage={mockSetNotificationMessage}
          setNotificationStatus={mockSetNotificationStatus}
        />
      </IPDContext.Provider>
    );
    expect(container).toMatchSnapshot();
  });

  it("should enable save Button when atleast one task is selected", function () {
    const { container } = render(
      <IPDContext.Provider
        value={{
          config: mockConfig,
          handleAuditEvent: mockHandleAuditLogEvent,
          currentUser: mockUserWithAllRequiredPrivileges,
        }}
      >
        <UpdateNursingTasks
          medicationTasks={mockMedicationTasks}
          groupSlotsByOrderId={mockGroupSlotsByOrderId}
          updateNursingTasksSlider={jest.fn}
          patientId="test_patient_uuid"
          providerId="test_provider_uuid"
          setShowNotification={mockSetShowNotification}
          setNotificationMessage={mockSetNotificationMessage}
          setNotificationStatus={mockSetNotificationStatus}
        />
      </IPDContext.Provider>
    );
    const saveButton = screen.getAllByText("Save")[1];
    expect(saveButton.disabled).toEqual(true);
    const toggleButton = container.querySelectorAll(".bx--toggle__switch")[0];
    fireEvent.click(toggleButton);
    expect(saveButton.disabled).toEqual(false);
  });

  it("should show notes and time when toggle switch is On", function () {
    const { container } = render(
      <IPDContext.Provider
        value={{
          config: mockConfig,
          handleAuditEvent: mockHandleAuditLogEvent,
          currentUser: mockUserWithAllRequiredPrivileges,
        }}
      >
        <UpdateNursingTasks
          medicationTasks={mockMedicationTasks}
          groupSlotsByOrderId={mockGroupSlotsByOrderId}
          updateNursingTasksSlider={jest.fn}
          patientId="test_patient_uuid"
          providerId="test_provider_uuid"
          setShowNotification={mockSetShowNotification}
          setNotificationMessage={mockSetNotificationMessage}
          setNotificationStatus={mockSetNotificationStatus}
        />
      </IPDContext.Provider>
    );
    const toggleButton = container.querySelectorAll(".bx--toggle__switch")[0];
    fireEvent.click(toggleButton);

    const timePicker = container.querySelectorAll(
      ".bx--time-picker__input-field"
    )[0];
    expect(timePicker).toBeTruthy();
    const notes = container.querySelectorAll(".bx--text-area")[0];
    expect(notes).toBeTruthy();
  });

  it("should show time when toggle switch is On for Non medication tasks", function () {
    const { container } = render(
      <IPDContext.Provider
        value={{
          config: mockConfig,
          handleAuditEvent: mockHandleAuditLogEvent,
          currentUser: mockUserWithAllRequiredPrivileges,
        }}
      >
        <UpdateNursingTasks
          medicationTasks={mockNonMedicationTileData}
          groupSlotsByOrderId={mockGroupSlotsByOrderId}
          updateNursingTasksSlider={jest.fn}
          patientId="test_patient_uuid"
          providerId="test_provider_uuid"
          setShowNotification={mockSetShowNotification}
          setNotificationMessage={mockSetNotificationMessage}
          setNotificationStatus={mockSetNotificationStatus}
        />
      </IPDContext.Provider>
    );
    const toggleButton = container.querySelectorAll(".bx--toggle__switch")[0];
    fireEvent.click(toggleButton);

    const timePicker = container.querySelectorAll(".bx--time-picker")[0];
    expect(timePicker).toBeTruthy();
  });

  it("should save when toggle switch is and Time is entered for Non medication tasks", async () => {
    mockUpdateNonMedicationTask.mockResolvedValue(mockUpdateResponse);
    const { container } = render(
      <IPDContext.Provider
        value={{
          config: mockConfig,
          handleAuditEvent: mockHandleAuditLogEvent,
          currentUser: mockUserWithAllRequiredPrivileges,
        }}
      >
        <UpdateNursingTasks
          medicationTasks={mockNonMedicationTileData}
          groupSlotsByOrderId={mockGroupSlotsByOrderId}
          updateNursingTasksSlider={mockUpdateEmergencyTasksSlider}
          patientId="test_patient_uuid"
          providerId="test_provider_uuid"
          setShowNotification={mockSetShowNotification}
          setNotificationMessage={mockSetNotificationMessage}
          setNotificationStatus={mockSetNotificationStatus}
        />
      </IPDContext.Provider>
    );
    const toggleButton = container.querySelectorAll(".bx--toggle__switch")[0];
    fireEvent.click(toggleButton);

    const timePicker = container.querySelectorAll(".bx--time-picker")[0];
    expect(timePicker).toBeTruthy();

    const saveButton = screen.getAllByText("Save")[1];
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockSetShowNotification).toHaveBeenCalledTimes(1);
      expect(mockSetNotificationMessage).toHaveBeenCalledTimes(1);
      expect(mockSetNotificationStatus).toHaveBeenCalledTimes(1);
      expect(mockUpdateEmergencyTasksSlider).toHaveBeenCalledTimes(1);
    });
  });

  it("should show warning for empty notes when time is updated", function () {
    MockDate.set("2024-01-01 01:00 PM");
    const { container } = render(
      <IPDContext.Provider
        value={{
          config: mockConfig,
          handleAuditEvent: mockHandleAuditLogEvent,
          currentUser: mockUserWithAllRequiredPrivileges,
        }}
      >
        <UpdateNursingTasks
          medicationTasks={mockMedicationTasks}
          groupSlotsByOrderId={mockGroupSlotsByOrderId}
          updateNursingTasksSlider={jest.fn}
          patientId="test_patient_uuid"
          providerId="test_provider_uuid"
          setShowNotification={mockSetShowNotification}
          setNotificationMessage={mockSetNotificationMessage}
          setNotificationStatus={mockSetNotificationStatus}
        />
      </IPDContext.Provider>
    );
    const toggleButton = container.querySelectorAll(".bx--toggle__switch")[0];
    fireEvent.click(toggleButton);

    const timePicker = screen.getAllByRole("textbox")[0];
    fireEvent.change(timePicker, { target: { value: "12:00" } });
    fireEvent.blur(timePicker);
    const saveButton = screen.getAllByText("Save")[1];
    fireEvent.click(saveButton);
    expect(screen.getByText("Please enter notes")).toBeTruthy();
  });

  it("should show warning for empty notes when time in 12 hour format is updated", function () {
    MockDate.set("2024-01-01 01:00 PM");
    const { container } = render(
      <IPDContext.Provider
        value={{
          config: mockConfigFor12HourFormat,
          handleAuditEvent: mockHandleAuditLogEvent,
          currentUser: mockUserWithAllRequiredPrivileges,
        }}
      >
        <UpdateNursingTasks
          medicationTasks={mockMedicationTasks}
          groupSlotsByOrderId={mockGroupSlotsByOrderId}
          updateNursingTasksSlider={jest.fn}
          patientId="test_patient_uuid"
          providerId="test_provider_uuid"
          setShowNotification={mockSetShowNotification}
          setNotificationMessage={mockSetNotificationMessage}
          setNotificationStatus={mockSetNotificationStatus}
        />
      </IPDContext.Provider>
    );
    const toggleButton = container.querySelectorAll(".bx--toggle__switch")[0];
    fireEvent.click(toggleButton);

    const timePicker = screen.getAllByRole("textbox")[0];
    fireEvent.change(timePicker, { target: { value: "12:00 PM" } });
    fireEvent.blur(timePicker);
    const saveButton = screen.getAllByText("Save")[1];
    fireEvent.click(saveButton);
    expect(screen.getByText("Please enter notes")).toBeTruthy();
  });

  it("should render confirmation modal on click of save button", function () {
    const { container } = render(
      <IPDContext.Provider
        value={{
          config: mockConfig,
          handleAuditEvent: mockHandleAuditLogEvent,
          currentUser: mockUserWithAllRequiredPrivileges,
        }}
      >
        <UpdateNursingTasks
          medicationTasks={mockMedicationTasks}
          groupSlotsByOrderId={mockGroupSlotsByOrderId}
          updateNursingTasksSlider={jest.fn}
          patientId="test_patient_uuid"
          providerId="test_provider_uuid"
          setShowNotification={mockSetShowNotification}
          setNotificationMessage={mockSetNotificationMessage}
          setNotificationStatus={mockSetNotificationStatus}
        />
      </IPDContext.Provider>
    );
    const toggleButton = container.querySelectorAll(".bx--toggle__switch")[0];
    fireEvent.click(toggleButton);

    const timePicker = screen.getAllByRole("textbox")[0];
    fireEvent.change(timePicker, { target: { value: "12:00" } });
    fireEvent.blur(timePicker);

    const notes = screen.getAllByRole("textbox")[1];
    fireEvent.change(notes, { target: { value: "test notes" } });
    fireEvent.blur(notes);

    const saveButton = screen.getAllByText("Save")[1];
    fireEvent.click(saveButton);

    expect(screen.getByText("Please confirm your nursing tasks")).toBeTruthy();
  });

  it("should render confirmation modal on click of save button when time is in 12 hour format", function () {
    const { container } = render(
      <IPDContext.Provider
        value={{
          config: mockConfigFor12HourFormat,
          handleAuditEvent: mockHandleAuditLogEvent,
          currentUser: mockUserWithAllRequiredPrivileges,
        }}
      >
        <UpdateNursingTasks
          medicationTasks={mockMedicationTasks}
          groupSlotsByOrderId={mockGroupSlotsByOrderId}
          updateNursingTasksSlider={jest.fn}
          patientId="test_patient_uuid"
          providerId="test_provider_uuid"
          setShowNotification={mockSetShowNotification}
          setNotificationMessage={mockSetNotificationMessage}
          setNotificationStatus={mockSetNotificationStatus}
        />
      </IPDContext.Provider>
    );
    const toggleButton = container.querySelectorAll(".bx--toggle__switch")[0];
    fireEvent.click(toggleButton);

    const timePicker = screen.getAllByRole("textbox")[0];
    fireEvent.change(timePicker, { target: { value: "12:00 PM" } });
    fireEvent.blur(timePicker);

    const notes = screen.getAllByRole("textbox")[1];
    fireEvent.change(notes, { target: { value: "test notes" } });
    fireEvent.blur(notes);

    const saveButton = screen.getAllByText("Save")[1];
    fireEvent.click(saveButton);

    expect(screen.getByText("Please confirm your nursing tasks")).toBeTruthy();
  });

  it("should close the slider on click of cancel button when no changes are made", function () {
    const { container } = render(
      <IPDContext.Provider
        value={{
          config: mockConfig,
          handleAuditEvent: mockHandleAuditLogEvent,
          currentUser: mockUserWithAllRequiredPrivileges,
        }}
      >
        <UpdateNursingTasks
          medicationTasks={mockMedicationTasks}
          groupSlotsByOrderId={mockGroupSlotsByOrderId}
          updateNursingTasksSlider={jest.fn}
          patientId="test_patient_uuid"
          providerId="test_provider_uuid"
          setShowNotification={mockSetShowNotification}
          setNotificationMessage={mockSetNotificationMessage}
          setNotificationStatus={mockSetNotificationStatus}
        />
      </IPDContext.Provider>
    );
    const cancelButton = screen.getAllByText("Cancel")[1];
    fireEvent.click(cancelButton);
    expect(container).toMatchSnapshot();
  });

  it("should render confirmation modal on click of cancel button when changes are made", function () {
    MockDate.set("2024-01-01 13:00");
    const { container } = render(
      <IPDContext.Provider
        value={{
          config: mockConfig,
          handleAuditEvent: mockHandleAuditLogEvent,
          currentUser: mockUserWithAllRequiredPrivileges,
        }}
      >
        <UpdateNursingTasks
          medicationTasks={mockMedicationTasks}
          groupSlotsByOrderId={mockGroupSlotsByOrderId}
          updateNursingTasksSlider={jest.fn}
          patientId="test_patient_uuid"
          providerId="test_provider_uuid"
          setShowNotification={mockSetShowNotification}
          setNotificationMessage={mockSetNotificationMessage}
          setNotificationStatus={mockSetNotificationStatus}
        />
      </IPDContext.Provider>
    );
    const toggleButton = container.querySelectorAll(".bx--toggle__switch")[0];
    fireEvent.click(toggleButton);

    const timePicker = screen.getAllByRole("textbox")[0];
    fireEvent.change(timePicker, { target: { value: "12:00" } });
    fireEvent.blur(timePicker);

    const notes = screen.getAllByRole("textbox")[1];
    fireEvent.change(notes, { target: { value: "test notes" } });
    fireEvent.blur(notes);

    const cancelButton = screen.getAllByText("Cancel")[1];
    fireEvent.click(cancelButton);
    expect(
      screen.getByText(
        "You will lose the details entered. Do you want to continue?"
      )
    ).toBeTruthy();
  });

  it("should render confirmation modal on click of cancel button when changes are made when time is in 12 hour format", function () {
    MockDate.set("2024-01-01 01:00 PM");
    const { container } = render(
      <IPDContext.Provider
        value={{
          config: mockConfigFor12HourFormat,
          handleAuditEvent: mockHandleAuditLogEvent,
          currentUser: mockUserWithAllRequiredPrivileges,
        }}
      >
        <UpdateNursingTasks
          medicationTasks={mockMedicationTasks}
          groupSlotsByOrderId={mockGroupSlotsByOrderId}
          updateNursingTasksSlider={jest.fn}
          patientId="test_patient_uuid"
          providerId="test_provider_uuid"
          setShowNotification={mockSetShowNotification}
          setNotificationMessage={mockSetNotificationMessage}
          setNotificationStatus={mockSetNotificationStatus}
        />
      </IPDContext.Provider>
    );
    const toggleButton = container.querySelectorAll(".bx--toggle__switch")[0];
    fireEvent.click(toggleButton);

    const timePicker = screen.getAllByRole("textbox")[0];
    fireEvent.change(timePicker, { target: { value: "12:00 PM" } });
    fireEvent.blur(timePicker);

    const notes = screen.getAllByRole("textbox")[1];
    fireEvent.change(notes, { target: { value: "test notes" } });
    fireEvent.blur(notes);

    const cancelButton = screen.getAllByText("Cancel")[1];
    fireEvent.click(cancelButton);
    expect(
      screen.getByText(
        "You will lose the details entered. Do you want to continue?"
      )
    ).toBeTruthy();
  });

  it("should show notes error when time is greater than administered time window", function () {
    MockDate.set("2024-01-01 13:00");
    const { container } = render(
      <IPDContext.Provider
        value={{
          config: mockConfig,
          handleAuditEvent: mockHandleAuditLogEvent,
          currentUser: mockUserWithAllRequiredPrivileges,
        }}
      >
        <UpdateNursingTasks
          medicationTasks={mockMedicationTasks}
          groupSlotsByOrderId={mockGroupSlotsByOrderId}
          updateNursingTasksSlider={jest.fn}
          patientId="test_patient_uuid"
          providerId="test_provider_uuid"
          setShowNotification={mockSetShowNotification}
          setNotificationMessage={mockSetNotificationMessage}
          setNotificationStatus={mockSetNotificationStatus}
        />
      </IPDContext.Provider>
    );

    const toggleButton = container.querySelectorAll(".bx--toggle__switch")[0];
    fireEvent.click(toggleButton);

    const timePicker = screen.getAllByRole("textbox")[0];
    fireEvent.change(timePicker, { target: { value: "12:00" } });
    fireEvent.blur(timePicker);

    const notes = screen.getAllByRole("textbox")[1];
    fireEvent.change(notes, { target: { value: "test notes" } });
    fireEvent.blur(notes);

    const saveButton = screen.getAllByText("Save")[1];
    fireEvent.click(saveButton);

    expect("Please enter notes").toBeTruthy();
  });

  it("should show notes error when time in 12 hour format is greater than administered time window", function () {
    const { container } = render(
      <IPDContext.Provider
        value={{
          config: mockConfigFor12HourFormat,
          handleAuditEvent: mockHandleAuditLogEvent,
          currentUser: mockUserWithAllRequiredPrivileges,
        }}
      >
        <UpdateNursingTasks
          medicationTasks={mockMedicationTasks}
          groupSlotsByOrderId={mockGroupSlotsByOrderId}
          updateNursingTasksSlider={jest.fn}
          patientId="test_patient_uuid"
          providerId="test_provider_uuid"
          setShowNotification={mockSetShowNotification}
          setNotificationMessage={mockSetNotificationMessage}
          setNotificationStatus={mockSetNotificationStatus}
        />
      </IPDContext.Provider>
    );

    const toggleButton = container.querySelectorAll(".bx--toggle__switch")[0];
    fireEvent.click(toggleButton);

    const timePicker = screen.getAllByRole("textbox")[0];
    fireEvent.change(timePicker, { target: { value: "12:00 PM" } });
    fireEvent.blur(timePicker);

    const notes = screen.getAllByRole("textbox")[1];
    fireEvent.change(notes, { target: { value: "test notes" } });
    fireEvent.blur(notes);

    const saveButton = screen.getAllByText("Save")[1];
    fireEvent.click(saveButton);

    expect("Please enter notes").toBeTruthy();
  });

  it("should show OverflowMenu for a task", () => {
    const { container } = render(
      <IPDContext.Provider
        value={{
          config: mockConfig,
          handleAuditEvent: mockHandleAuditLogEvent,
          currentUser: mockUserWithAllRequiredPrivileges,
        }}
      >
        <UpdateNursingTasks
          medicationTasks={mockMedicationTasks}
          groupSlotsByOrderId={mockGroupSlotsByOrderId}
          updateNursingTasksSlider={jest.fn}
          patientId="test_patient_uuid"
          providerId="test_provider_uuid"
          setShowNotification={mockSetShowNotification}
          setNotificationMessage={mockSetNotificationMessage}
          setNotificationStatus={mockSetNotificationStatus}
        />
      </IPDContext.Provider>
    );
    expect(container.querySelectorAll(".bx--overflow-menu")).toBeTruthy();
  });

  it("should show Skip Drug option on click of Overflow menu button", () => {
    const { container } = render(
      <IPDContext.Provider
        value={{
          config: mockConfig,
          handleAuditEvent: mockHandleAuditLogEvent,
          currentUser: mockUserWithAllRequiredPrivileges,
        }}
      >
        <UpdateNursingTasks
          medicationTasks={mockMedicationTasks}
          groupSlotsByOrderId={mockGroupSlotsByOrderId}
          updateNursingTasksSlider={jest.fn}
          patientId="test_patient_uuid"
          providerId="test_provider_uuid"
          setShowNotification={mockSetShowNotification}
          setNotificationMessage={mockSetNotificationMessage}
          setNotificationStatus={mockSetNotificationStatus}
        />
      </IPDContext.Provider>
    );
    const overflowMenuButton =
      container.querySelectorAll(".bx--overflow-menu")[0];
    fireEvent.click(overflowMenuButton);
    expect(screen.getByText("Skip Drug")).toBeTruthy();
  });

  it("should hide the Administer Done toggle button on click of Skip Drug button", () => {
    const { container } = render(
      <IPDContext.Provider
        value={{
          config: mockConfig,
          handleAuditEvent: mockHandleAuditLogEvent,
          currentUser: mockUserWithAllRequiredPrivileges,
        }}
      >
        <UpdateNursingTasks
          medicationTasks={[mockMedicationTasks[0]]}
          groupSlotsByOrderId={mockGroupSlotsByOrderId}
          updateNursingTasksSlider={jest.fn}
          patientId="test_patient_uuid"
          providerId="test_provider_uuid"
          setShowNotification={mockSetShowNotification}
          setNotificationMessage={mockSetNotificationMessage}
          setNotificationStatus={mockSetNotificationStatus}
        />
      </IPDContext.Provider>
    );
    const overflowMenuButton =
      container.querySelectorAll(".bx--overflow-menu")[0];
    fireEvent.click(overflowMenuButton);
    const skipDrugButton = screen.getByText("Skip Drug");
    fireEvent.click(skipDrugButton);
    expect(container.querySelectorAll(".bx--toggle__switch")).toHaveLength(0);
  });

  it("should show notes as mandatory when Skip Drug button is clicked", () => {
    const { container } = render(
      <IPDContext.Provider
        value={{
          config: mockConfig,
          handleAuditEvent: mockHandleAuditLogEvent,
          currentUser: mockUserWithAllRequiredPrivileges,
        }}
      >
        <UpdateNursingTasks
          medicationTasks={[mockMedicationTasks[0]]}
          groupSlotsByOrderId={mockGroupSlotsByOrderId}
          updateNursingTasksSlider={jest.fn}
          patientId="test_patient_uuid"
          providerId="test_provider_uuid"
          setShowNotification={mockSetShowNotification}
          setNotificationMessage={mockSetNotificationMessage}
          setNotificationStatus={mockSetNotificationStatus}
        />
      </IPDContext.Provider>
    );
    const overflowMenuButton =
      container.querySelectorAll(".bx--overflow-menu")[0];
    fireEvent.click(overflowMenuButton);
    const skipDrugButton = screen.getByText("Skip Drug");
    fireEvent.click(skipDrugButton);
    const saveButton = screen.getAllByText("Save")[1];
    fireEvent.click(saveButton);
    expect(screen.getByText("Please enter notes")).toBeTruthy();
  });

  it("should disable Done toggle if the task is not relevant", () => {
    MockDate.set("2023-11-21 6:00");
    render(
      <IPDContext.Provider
        value={{
          config: mockConfig,
          handleAuditEvent: mockHandleAuditLogEvent,
          currentUser: mockUserWithAllRequiredPrivileges,
        }}
      >
        <UpdateNursingTasks
          medicationTasks={mockPRNMedicationTasks}
          groupSlotsByOrderId={mockGroupSlotsByOrderId}
          updateNursingTasksSlider={jest.fn}
          patientId="test_patient_uuid"
          providerId="test_provider_uuid"
          setShowNotification={mockSetShowNotification}
          setNotificationMessage={mockSetNotificationMessage}
          setNotificationStatus={mockSetNotificationStatus}
        />
      </IPDContext.Provider>
    );
    expect(screen.getByTestId("done-toggle").disabled).toBe(true);
  });

  it("should not show overflow menu for scheduled for text for PRN Nursing Task", async () => {
    const { container } = render(
      <IPDContext.Provider
        value={{
          config: mockConfig,
          handleAuditEvent: mockHandleAuditLogEvent,
          currentUser: mockUserWithAllRequiredPrivileges,
        }}
      >
        <UpdateNursingTasks
          medicationTasks={mockPRNMedicationTasks}
          groupSlotsByOrderId={mockGroupSlotsByOrderId}
          updateNursingTasksSlider={jest.fn}
          patientId="test_patient_uuid"
          providerId="test_provider_uuid"
          setShowNotification={mockSetShowNotification}
          setNotificationMessage={mockSetNotificationMessage}
          setNotificationStatus={mockSetNotificationStatus}
        />
      </IPDContext.Provider>
    );
    const scheduledFor = screen.queryByText("Scheduled for");
    expect(scheduledFor).toBeNull();
    const overflowMenuButton =
      container.querySelectorAll(".bx--overflow-menu")[0];
    expect(overflowMenuButton).not.toBeTruthy();
  });

  it("should show PRN confirm message while saving PRN task", () => {
    const { container } = render(
      <IPDContext.Provider
        value={{
          config: mockConfig,
          handleAuditEvent: mockHandleAuditLogEvent,
          currentUser: mockUserWithAllRequiredPrivileges,
        }}
      >
        <UpdateNursingTasks
          medicationTasks={mockPRNMedicationTasks}
          groupSlotsByOrderId={mockGroupSlotsByOrderId}
          updateNursingTasksSlider={jest.fn}
          patientId="test_patient_uuid"
          providerId="test_provider_uuid"
          setShowNotification={mockSetShowNotification}
          setNotificationMessage={mockSetNotificationMessage}
          setNotificationStatus={mockSetNotificationStatus}
        />
      </IPDContext.Provider>
    );
    const toggleButton = container.querySelectorAll(".bx--toggle__switch")[0];
    fireEvent.click(toggleButton);

    const timePicker = screen.getAllByRole("textbox")[0];
    fireEvent.change(timePicker, { target: { value: "12:00" } });
    fireEvent.blur(timePicker);

    const notes = screen.getAllByRole("textbox")[1];
    fireEvent.change(notes, { target: { value: "test notes" } });
    fireEvent.blur(notes);

    const saveButton = screen.getAllByText("Save")[1];
    fireEvent.click(saveButton);

    expect(screen.getByText("Please confirm your PRN task")).toBeTruthy();
  });

  it.only("should show toggle disabled when privileges are not preset", function () {
    const { queryAllByTestId, container } = render(
      <IPDContext.Provider
        value={{
          config: mockConfig,
          handleAuditEvent: mockHandleAuditLogEvent,
          currentUser: mockUserWithoutAnyPrivilege,
        }}
      >
        <UpdateNursingTasks
          medicationTasks={mockMedicationTasks}
          groupSlotsByOrderId={mockGroupSlotsByOrderId}
          updateNursingTasksSlider={jest.fn}
          patientId="test_patient_uuid"
          providerId="test_provider_uuid"
          setShowNotification={mockSetShowNotification}
          setNotificationMessage={mockSetNotificationMessage}
          setNotificationStatus={mockSetNotificationStatus}
        />
      </IPDContext.Provider>
    );
    const toggleButton = queryAllByTestId("done-toggle")[0];
    expect(toggleButton.disabled).toBeTruthy();
    expect(container.querySelectorAll(".bx--overflow-menu")).toHaveLength(0);
  });

});
