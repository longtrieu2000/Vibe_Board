import { useState, useEffect } from "react";

export function useConnectors(boardId) {
  const [connectors, setConnectors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConnectors();
  }, [boardId]);

  const loadConnectors = async () => {
    try {
      const response = await fetch(`/api/boards/${boardId}/connectors`);
      if (!response.ok) throw new Error("Failed to load connectors");
      const data = await response.json();
      setConnectors(data.connectors);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const createConnector = async (fromCardId, toCardId, label = null) => {
    try {
      const response = await fetch(`/api/boards/${boardId}/connectors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromCardId, toCardId, label }),
      });

      if (!response.ok) throw new Error("Failed to create connector");
      const data = await response.json();

      setConnectors((prev) => [...prev, data.connector]);
      return data.connector;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const updateConnectorLabel = async (connectorId, label) => {
    try {
      await fetch(`/api/boards/${boardId}/connectors/${connectorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label }),
      });

      setConnectors((prev) =>
        prev.map((conn) =>
          conn.id === connectorId ? { ...conn, label } : conn,
        ),
      );
    } catch (error) {
      console.error(error);
    }
  };

  const updateConnection = async (connectorId, newFromCardId, newToCardId) => {
    try {
      await fetch(`/api/boards/${boardId}/connectors/${connectorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromCardId: newFromCardId,
          toCardId: newToCardId,
        }),
      });

      setConnectors((prev) =>
        prev.map((conn) =>
          conn.id === connectorId
            ? { ...conn, from_card_id: newFromCardId, to_card_id: newToCardId }
            : conn,
        ),
      );
    } catch (error) {
      console.error(error);
    }
  };

  const deleteConnector = async (connectorId) => {
    try {
      await fetch(`/api/boards/${boardId}/connectors/${connectorId}`, {
        method: "DELETE",
      });

      setConnectors((prev) => prev.filter((conn) => conn.id !== connectorId));
    } catch (error) {
      console.error(error);
    }
  };

  return {
    connectors,
    loading,
    createConnector,
    updateConnectorLabel,
    updateConnection,
    deleteConnector,
  };
}
