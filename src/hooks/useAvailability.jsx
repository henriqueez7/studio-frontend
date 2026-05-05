import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getAvailableBarbers,
  getAvailableDates,
  getAvailableTimes,
} from "../services/availabilityService.js";
import { getErrorMessage } from "../utils/errors.js";

function normalizeBarbers(response) {
  const list = Array.isArray(response)
    ? response
    : response?.value ??
      response?.barbers ??
      response?.data ??
      (response?.id ? [response] : []);

  return Array.isArray(list)
    ? list.map((barber) => ({
        id: barber.id ?? barber._id,
        name: barber.name || barber.fullName || barber.nickname || "Barbeiro",
      }))
    : [];
}

function normalizePrimitiveList(response) {
  const list = Array.isArray(response)
    ? response
    : response?.value ??
      response?.items ??
      response?.results ??
      response?.content ??
      response?.dates ??
      response?.availableDates ??
      response?.times ??
      response?.availableTimes ??
      response?.data ??
      (response?.date ||
      response?.availableDate ||
      response?.appointmentDate ||
      response?.startTime ||
      response?.availableTime ||
      response?.time
        ? [response]
        : []);

  return Array.isArray(list) ? list : [];
}

function normalizeDates(response) {
  return normalizePrimitiveList(response)
    .map((item) => {
      if (typeof item === "string") return item;
      return (
        item?.date ??
        item?.availableDate ??
        item?.appointmentDate ??
        item?.day ??
        item?.slotDate ??
        item?.dateValue ??
        null
      );
    })
    .filter(Boolean);
}

function normalizeTimes(response) {
  return normalizePrimitiveList(response)
    .map((item) => {
      if (typeof item === "string") return item;
      return (
        item?.startTime ??
        item?.availableTime ??
        item?.time ??
        item?.hour ??
        item?.slot ??
        item?.slotTime ??
        null
      );
    })
    .filter(Boolean);
}

export default function useAvailability({ barberId, serviceIds, date, appointmentId } = {}) {
  const [barbers, setBarbers] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loadingBarbers, setLoadingBarbers] = useState(true);
  const [loadingDates, setLoadingDates] = useState(false);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [error, setError] = useState(null);

  const loadBarbers = useCallback(async () => {
    setLoadingBarbers(true);
    setError(null);

    try {
      const response = await getAvailableBarbers();
      setBarbers(normalizeBarbers(response));
    } catch (err) {
      setError(getErrorMessage(err, "Não foi possível carregar os barbeiros disponíveis."));
    } finally {
      setLoadingBarbers(false);
    }
  }, []);

  const loadDates = useCallback(async () => {
    if (!barberId || !serviceIds?.length) {
      setAvailableDates([]);
      return;
    }

    setLoadingDates(true);
    setError(null);

    try {
      const response = await getAvailableDates(barberId, serviceIds);
      setAvailableDates(normalizeDates(response));
    } catch (err) {
      setError(getErrorMessage(err, "Não foi possível carregar as datas disponíveis."));
      setAvailableDates([]);
    } finally {
      setLoadingDates(false);
    }
  }, [barberId, serviceIds]);

  const loadTimes = useCallback(async () => {
    if (!barberId || !date || !serviceIds?.length) {
      setAvailableTimes([]);
      return;
    }

    setLoadingTimes(true);
    setError(null);

    try {
      const response = await getAvailableTimes(barberId, date, serviceIds, appointmentId);
      setAvailableTimes(normalizeTimes(response));
    } catch (err) {
      setError(getErrorMessage(err, "Não foi possível carregar os horários disponíveis."));
      setAvailableTimes([]);
    } finally {
      setLoadingTimes(false);
    }
  }, [appointmentId, barberId, date, serviceIds]);

  useEffect(() => {
    loadBarbers();
  }, [loadBarbers]);

  useEffect(() => {
    loadDates();
  }, [loadDates]);

  useEffect(() => {
    loadTimes();
  }, [loadTimes]);

  const hasSelectionReady = useMemo(
    () => Boolean(barberId && serviceIds?.length),
    [barberId, serviceIds],
  );

  return {
    barbers,
    availableDates,
    availableTimes,
    loadingBarbers,
    loadingDates,
    loadingTimes,
    error,
    hasSelectionReady,
    refetchBarbers: loadBarbers,
    refetchDates: loadDates,
    refetchTimes: loadTimes,
    clearError: () => setError(null),
  };
}
