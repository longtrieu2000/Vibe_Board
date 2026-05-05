-- Schema
--
-- PostgreSQL database dump
--

-- Dumped from database version 17.8 (92d3c18)
-- Dumped by pg_dump version 17.8 (92d3c18)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: boards; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.boards (
    id integer NOT NULL,
    name text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    is_public boolean DEFAULT false,
    share_token text
);


ALTER TABLE public.boards OWNER TO neondb_owner;

--
-- Name: boards_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.boards_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.boards_id_seq OWNER TO neondb_owner;

--
-- Name: boards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.boards_id_seq OWNED BY public.boards.id;


--
-- Name: cards; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.cards (
    id integer NOT NULL,
    board_id integer NOT NULL,
    card_type text NOT NULL,
    x integer DEFAULT 0,
    y integer DEFAULT 0,
    width integer DEFAULT 280,
    height integer DEFAULT 200,
    video_url text,
    platform text,
    thumbnail_url text,
    video_title text,
    note_text text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    image_url text,
    image_caption text,
    note_color text DEFAULT 'yellow'::text,
    text_size text DEFAULT 'medium'::text,
    pdf_url text,
    pdf_name text,
    file_url text,
    file_type text,
    text_content text,
    text_color text DEFAULT '#000000'::text,
    font_family text DEFAULT 'JetBrains Mono'::text,
    slot1_card_id integer,
    slot2_card_id integer,
    slot3_card_id integer,
    slot4_card_id integer,
    CONSTRAINT cards_card_type_check CHECK ((card_type = ANY (ARRAY['video'::text, 'note'::text, 'image'::text, 'pdf'::text, 'text'::text, 'collection'::text])))
);


ALTER TABLE public.cards OWNER TO neondb_owner;

--
-- Name: cards_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.cards_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cards_id_seq OWNER TO neondb_owner;

--
-- Name: cards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.cards_id_seq OWNED BY public.cards.id;


--
-- Name: comments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.comments (
    id integer NOT NULL,
    card_id integer NOT NULL,
    comment_text text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.comments OWNER TO neondb_owner;

--
-- Name: comments_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comments_id_seq OWNER TO neondb_owner;

--
-- Name: comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.comments_id_seq OWNED BY public.comments.id;


--
-- Name: connectors; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.connectors (
    id integer NOT NULL,
    board_id integer NOT NULL,
    from_card_id integer NOT NULL,
    to_card_id integer NOT NULL,
    label text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.connectors OWNER TO neondb_owner;

--
-- Name: connectors_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.connectors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.connectors_id_seq OWNER TO neondb_owner;

--
-- Name: connectors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.connectors_id_seq OWNED BY public.connectors.id;


--
-- Name: boards id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.boards ALTER COLUMN id SET DEFAULT nextval('public.boards_id_seq'::regclass);


--
-- Name: cards id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.cards ALTER COLUMN id SET DEFAULT nextval('public.cards_id_seq'::regclass);


--
-- Name: comments id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.comments ALTER COLUMN id SET DEFAULT nextval('public.comments_id_seq'::regclass);


--
-- Name: connectors id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.connectors ALTER COLUMN id SET DEFAULT nextval('public.connectors_id_seq'::regclass);


--
-- Name: boards boards_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.boards
    ADD CONSTRAINT boards_pkey PRIMARY KEY (id);


--
-- Name: cards cards_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.cards
    ADD CONSTRAINT cards_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: connectors connectors_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.connectors
    ADD CONSTRAINT connectors_pkey PRIMARY KEY (id);


--
-- Name: idx_boards_share_token; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_boards_share_token ON public.boards USING btree (share_token);


--
-- Name: idx_comments_card_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_comments_card_id ON public.comments USING btree (card_id);


--
-- Name: idx_connectors_board_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_connectors_board_id ON public.connectors USING btree (board_id);


--
-- Name: idx_connectors_from_card; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_connectors_from_card ON public.connectors USING btree (from_card_id);


--
-- Name: idx_connectors_to_card; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_connectors_to_card ON public.connectors USING btree (to_card_id);


--
-- Name: cards cards_board_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.cards
    ADD CONSTRAINT cards_board_id_fkey FOREIGN KEY (board_id) REFERENCES public.boards(id) ON DELETE CASCADE;


--
-- Name: cards cards_slot1_card_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.cards
    ADD CONSTRAINT cards_slot1_card_id_fkey FOREIGN KEY (slot1_card_id) REFERENCES public.cards(id) ON DELETE SET NULL;


--
-- Name: cards cards_slot2_card_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.cards
    ADD CONSTRAINT cards_slot2_card_id_fkey FOREIGN KEY (slot2_card_id) REFERENCES public.cards(id) ON DELETE SET NULL;


--
-- Name: cards cards_slot3_card_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.cards
    ADD CONSTRAINT cards_slot3_card_id_fkey FOREIGN KEY (slot3_card_id) REFERENCES public.cards(id) ON DELETE SET NULL;


--
-- Name: cards cards_slot4_card_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.cards
    ADD CONSTRAINT cards_slot4_card_id_fkey FOREIGN KEY (slot4_card_id) REFERENCES public.cards(id) ON DELETE SET NULL;


--
-- Name: comments comments_card_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_card_id_fkey FOREIGN KEY (card_id) REFERENCES public.cards(id) ON DELETE CASCADE;


--
-- Name: connectors connectors_board_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.connectors
    ADD CONSTRAINT connectors_board_id_fkey FOREIGN KEY (board_id) REFERENCES public.boards(id) ON DELETE CASCADE;


--
-- Name: connectors connectors_from_card_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.connectors
    ADD CONSTRAINT connectors_from_card_id_fkey FOREIGN KEY (from_card_id) REFERENCES public.cards(id) ON DELETE CASCADE;


--
-- Name: connectors connectors_to_card_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.connectors
    ADD CONSTRAINT connectors_to_card_id_fkey FOREIGN KEY (to_card_id) REFERENCES public.cards(id) ON DELETE CASCADE;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--



-- Data