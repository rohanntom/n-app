export class Routes
{
    public static listTodos = "/todos";
    public static manageTodo = "/manage?{id?:string}";
    public static paxList = "/paxList";
    public static managePax = "/managePax?{id?: string}";


    /**
     * static
     */
    private constructor() { }
}