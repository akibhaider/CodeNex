import { Loading } from "@nextui-org/react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { asyncProgrammemRun, asyncProgrammemSubmit } from "../store/CodeSlice";
import { useGetProblemStatusQuery } from "../store/services/ProblemStatus";
import { RootState } from "../store/store";
import Editor from "./Editor";

export default function ProblemEditor() {
  const [drawerState, setDrawerState] = useState({
    bottomDrawer: "input",
    verdict: "",
    status: "in queue",
    output: "",
    userInput: "",
    jobId: "",
    userNote: "",
  });
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const drawer = searchParams.get("drawer");

  const {
    currentCode,
    currentLang,
    jobId: JobId,
    problem,
    user,
  } = useSelector((state: RootState) => ({
    currentCode: state.code.currentCode,
    currentLang: state.code.currentLang,
    jobId: state.code.jobId,
    problem: state.problem.singleProblem,
    user: state.auth.user,
  }));

  const problemData = useGetProblemStatusQuery(
    drawerState.jobId,
    !!drawerState.jobId ? { pollingInterval: 1000 } : { skip: true }
  );

  useEffect(() => {
    setDrawerState((prevState) => ({ ...prevState, jobId: JobId }));
  }, [JobId]);

  useEffect(() => {
    const fetchUserNote = async (jobId: string) => {
      try {
        const response = await fetch(`/api/jobs/fetch-note/${jobId}`);
        const data = await response.json();
        setDrawerState((prevState) => ({
          ...prevState,
          userNote: data.userNote || "",
        }));
      } catch (error) {
        console.error("Failed to fetch user note:", error);
      }
    };

    if (drawerState.jobId) {
      fetchUserNote(drawerState.jobId);
    }
  }, [drawerState.jobId]);

  useEffect(() => {
    const { data } = problemData;
    if (data && data.job.status !== "in queue") {
      setDrawerState((prevState) => ({
        ...prevState,
        status: data.job.status,
        output: data.job.output,
        bottomDrawer: data.job.verdict ? "result" : prevState.bottomDrawer,
        verdict: data.job.verdict || prevState.verdict,
      }));
    }
  }, [problemData.data]);

  const handleInputChange = useCallback((e: string) => {
    setDrawerState((prevState) => ({
      ...prevState,
      userInput: e,
    }));
  }, []);

  const handleUserNoteChange = useCallback((e: string) => {
    setDrawerState((prevState) => ({
      ...prevState,
      userNote: e,
    }));
  }, []);

  const handleRun = useCallback(async () => {
    setDrawerState({
      ...drawerState,
      status: "in queue",
      output: "",
      bottomDrawer: "output",
    });
    dispatch(
      asyncProgrammemRun({
        currentCode,
        currentLang,
        userInput: drawerState.userInput,
      }) as any
    );
  }, [dispatch, currentCode, currentLang, drawerState.userInput]);

  const handleSubmit = useCallback(async () => {
    if (!user) {
      toast.error("Please sign in to submit code");
      return;
    }
    let problemId = "";
    if (problem && problem._id) problemId = problem._id;
    setDrawerState({
      ...drawerState,
      status: "in queue",
      output: "",
      verdict: "",
      bottomDrawer: "output",
    });
    dispatch(
      asyncProgrammemSubmit({
        currentCode,
        currentLang,
        userInput: drawerState.userInput,
        problemId,
        userId: user._id,
      }) as any
    );
  }, [
    user,
    dispatch,
    currentCode,
    currentLang,
    drawerState.userInput,
    problem?._id,
  ]);

  const handleSaveUserNote = useCallback(async () => {
    if (!drawerState.jobId) return;

    try {
      const response = await fetch('/api/jobs/save-note', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: drawerState.jobId,
          userNote: drawerState.userNote,
        }),
      });

      if (response.ok) {
        toast.success("User note saved successfully");
      } else {
        toast.error("Failed to save user note");
      }
    } catch (error) {
      console.error("Failed to save user note:", error);
      toast.error("Failed to save user note");
    }
  }, [drawerState.jobId, drawerState.userNote]);

  return (
    <div className="min-w-[45%] border problemPage border-r-0 pr-0 pb-0 p-3 flex flex-col overflow-hidden">
      {(drawer === "description" || !drawer) && (
        <>
          <div className="">
            <Editor />
          </div>
          <div className="bg-gray-100 text-sm text-gray-700 space-x-4 p-2">
            <button
              className={`${
                drawerState.bottomDrawer === "input" && "bg-white shadow"
              } p-2 px-4 rounded-md`}
              onClick={() =>
                setDrawerState({ ...drawerState, bottomDrawer: "input" })
              }
            >
              Custom Input
            </button>
            <button
              className={`${
                drawerState.bottomDrawer === "output" && "bg-white shadow"
              } p-2 px-4 rounded-md`}
              disabled={!drawerState.output}
              onClick={() =>
                setDrawerState({ ...drawerState, bottomDrawer: "output" })
              }
            >
              Output
            </button>
            <button
              className={`${
                drawerState.bottomDrawer === "result" && "bg-white shadow"
              } p-1 px-4 rounded-md`}
              onClick={() =>
                setDrawerState({ ...drawerState, bottomDrawer: "result" })
              }
            >
              Code Result
            </button>
            <button
              className={`${
                drawerState.bottomDrawer === "userNote" && "bg-white shadow"
              } p-1 px-4 rounded-md`}
              onClick={() =>
                setDrawerState({ ...drawerState, bottomDrawer: "userNote" })
              }
            >
              User Note
            </button>
          </div>
          <div className="bg-gray-100 flex-grow flex flex-col items-end p-2 pt-2 min-h-[100px]">
            {drawerState.bottomDrawer === "input" ? (
              <textarea
                className="bg-white flex-grow w-full border outline-none p-2 font-bold rounded-sm shadow"
                value={drawerState.userInput}
                onChange={(e) => handleInputChange(e.target.value)}
              ></textarea>
            ) : drawerState.bottomDrawer === "result" ? (
              <div
                className={`bg-white flex-grow w-full border ${
                  drawerState.verdict === "ac"
                    ? "border-green-600"
                    : drawerState.verdict === "wa"
                    ? "border-red-600"
                    : drawerState.verdict === "tle"
                    ? "border-red-800"
                    : "border-slate-700"
                } outline-none p-2 text-xl grid place-items-center font-bold rounded-sm shadow`}
              >
                {drawerState.verdict === "ac" && (
                  <span className="text-green-600">ACCEPTED</span>
                )}
                {drawerState.verdict === "wa" && (
                  <span className="text-red-600">WRONG ANSWER</span>
                )}
                {drawerState.verdict === "tle" && (
                  <span className="text-red-800">TIME LIMIT EXCEEDED</span>
                )}
                {drawerState.verdict === "" && (
                  <span className="text-slate-800">
                    SUBMIT YOUR CODE FIRST.
                  </span>
                )}
              </div>
            ) : drawerState.bottomDrawer === "userNote" ? (
              <div className="w-full h-full bg-white rounded shadow p-2">
  <textarea
    className="font-mono text-sm p-1/7 h-full w-full outline-none mb-2"
    value={drawerState.userNote}
    onChange={(e) => handleUserNoteChange(e.target.value)}
  ></textarea>
  <button
    className="bg-slate-600 text-white rounded-md p-1 shadow text-xs"
    onClick={handleSaveUserNote}
  >
    Save Note
  </button>
</div>

            ) : (
              <div className="w-full h-full bg-white rounded shadow p-4">
                {drawerState.status === "in queue" ? (
                  <div className="w-full h-full flex items-center justify-center flex-col gap-3">
                    <Loading type="spinner" />
                    <span>{drawerState.status.toUpperCase()}</span>
                  </div>
                ) : (
                  <textarea
                    readOnly
                    className="font-mono text p-1 h-full w-full px-4 outline-none textarea"
                    value={drawerState.output}
                  ></textarea>
                )}
              </div>
            )}
          </div>
          <div className="space-x-2 py-2 px-1 flex items-center bg-gray-200 border border-t w-full">
  <button
    className="bg-slate-600 text-white rounded-md p-1 shadow text-sm"
    onClick={handleRun}
  >
    Run
  </button>
  <button
    className="bg-slate-600 text-white rounded-md p-1 shadow text-sm"
    onClick={handleSubmit}
  >
    Submit
  </button>
</div>

        </>
      )}
    </div>
  );
}